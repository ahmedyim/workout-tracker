'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { generateJson } from '@/lib/ai/gemini'
import { summarySchema, type WorkoutSummary } from '@/lib/ai/summarySchema'

type SetRow = { reps: number; weightKg: unknown }

// Numbers are calculated in code, not by the AI, so they can't be invented
function summarizeSets(sets: SetRow[]) {
    const rows = sets.map((s) => ({ reps: s.reps, kg: Number(s.weightKg) }))
    const volumeKg = rows.reduce((sum, s) => sum + s.reps * s.kg, 0)
    const topWeightKg = rows.reduce((max, s) => Math.max(max, s.kg), 0)
    const repsAtTopWeight = rows
        .filter((s) => s.kg === topWeightKg)
        .reduce((max, s) => Math.max(max, s.reps), 0)

    return {
        sets: rows.length,
        volumeKg: Math.round(volumeKg),
        topWeightKg,
        repsAtTopWeight,
    }
}

export async function generateWorkoutSummary(
    workoutId: string
): Promise<{ ok: true; summary: WorkoutSummary } | { ok: false; error: string }> {
    const session = await getSession()
    if (!session) return { ok: false, error: 'Please log in again.' }

    // Ownership: the userId filter is always part of the query
    const workout = await db.workout.findFirst({
        where: { id: workoutId, userId: session.userId },
        select: {
            id: true,
            title: true,
            status: true,
            completedAt: true,
            exercises: {
                orderBy: { position: 'asc' },
                select: {
                    exerciseId: true,
                    exercise: { select: { name: true } },
                    sets: {
                        orderBy: { setNumber: 'asc' },
                        select: { reps: true, weightKg: true },
                    },
                },
            },
        },
    })

    if (!workout) return { ok: false, error: 'Workout not found.' }
    if (workout.status !== 'COMPLETED') {
        return { ok: false, error: 'Summaries are available after you finish a workout.' }
    }

    const exerciseIds = workout.exercises.map((e) => e.exerciseId)
    const cutoff = workout.completedAt ?? new Date()

    // Up to three earlier completed workouts that used any of the same exercises
    const previous = await db.workout.findMany({
        where: {
            userId: session.userId,
            status: 'COMPLETED',
            id: { not: workout.id },
            completedAt: { lt: cutoff },
            exercises: { some: { exerciseId: { in: exerciseIds } } },
        },
        orderBy: { completedAt: 'desc' },
        take: 3,
        select: {
            completedAt: true,
            exercises: {
                where: { exerciseId: { in: exerciseIds } },
                select: {
                    exerciseId: true,
                    sets: { select: { reps: true, weightKg: true } },
                },
            },
        },
    })

    // Build a compact report: today's numbers next to each earlier session
    const report = {
        workout: workout.title,
        exercises: workout.exercises.map((we) => ({
            name: we.exercise.name,
            today: summarizeSets(we.sets),
            previous: previous
                .map((p) => {
                    const match = p.exercises.find((pe) => pe.exerciseId === we.exerciseId)
                    if (!match) return null
                    return {
                        date: p.completedAt?.toISOString().slice(0, 10) ?? 'unknown',
                        ...summarizeSets(match.sets),
                    }
                })
                .filter((x): x is NonNullable<typeof x> => x !== null),
        })),
    }

    const system = `You are a supportive strength coach writing short workout summaries.
Use ONLY the numbers in the data provided. Do not invent figures.
Respond with JSON only. No prose, no markdown, no code fences.`

    const prompt = `Summarize this completed workout.

Data (JSON):
${JSON.stringify(report)}

Rules:
- If an exercise has no "previous" entries, it is new for comparison. Do not call it improved or stalled.
- If there is no history at all, leave "improved" and "stalled" as empty arrays and say so in the headline.
- "improved": compare today's volumeKg, topWeightKg, or repsAtTopWeight with the most recent previous session.
- "stalled": same comparison, but no change or a drop.
- "focusNext": 1 to 3 concrete, practical suggestions for the next session.
- Keep every item to one short sentence.

Return JSON in this exact shape:
{
  "headline": "one short sentence summarizing the session",
  "improved": ["..."],
  "stalled": ["..."],
  "focusNext": ["..."]
}`

    let summary: WorkoutSummary
    try {
        const raw = await generateJson(prompt, system)
        const parsed = summarySchema.safeParse(raw)
        if (!parsed.success) {
            return { ok: false, error: 'The summary format was invalid. Please try again.' }
        }
        summary = parsed.data
    } catch (err) {
        console.error('Workout summary failed:', err)
        return { ok: false, error: 'The summary could not be generated. Please try again.' }
    }

    // Save so the summary loads instantly next time, without another AI call
    await db.workout.update({
        where: { id: workout.id },
        data: { aiSummary: summary, aiSummaryAt: new Date() },
    })

    revalidatePath(`/workouts/${workout.id}`)
    return { ok: true, summary }
}


