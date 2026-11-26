'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { generatePlanJson } from '@/lib/ai/gemini'
import {
    planInputSchema,
    generatedPlanSchema,
    type PlanInput,
} from '@/lib/ai/planSchema'

// A plan with exercise names attached, so the preview can display them
export type EnrichedPlan = {
    name: string
    days: {
        title: string
        exercises: { exerciseId: string; name: string; sets: { reps: number; weightKg: number }[] }[]
    }[]
}

export async function generatePlan(
    input: PlanInput
): Promise<{ ok: true; plan: EnrichedPlan } | { ok: false; error: string }> {
    const session = await getSession()
    if (!session) return { ok: false, error: 'Please log in again.' }

    const parsed = planInputSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: 'Please check your selections.' }

    // Only the user's own exercises can appear in the plan
    const exercises = await db.exercise.findMany({
        select: { id: true, name: true, muscleGroup: true },
        orderBy: { name: 'asc' },
    })
    if (exercises.length === 0) {
        return { ok: false, error: 'Add some exercises to your library first.' }
    }

    const catalog = exercises
        .map((e) => `${e.id} | ${e.name} | ${e.muscleGroup}`)
        .join('\n')

    const { goal, daysPerWeek, equipment, experience } = parsed.data

    const system = `You are an experienced strength and conditioning coach.
Respond with JSON only. No prose, no markdown, no code fences.`

    const prompt = `Create a weekly training plan.

Goal: ${goal}
Training days per week: ${daysPerWeek}
Available equipment: ${equipment.join(', ')}
Experience level: ${experience}

Use ONLY exercises from this list. Each line is: id | name | muscle group
${catalog}

Rules:
- Create exactly ${daysPerWeek} days.
- Each day has 3 to 6 exercises.
- Balance muscle groups across the week.
- Choose sets, reps, and weightKg that suit the goal and experience level.
  Use weightKg 0 for bodyweight exercises.

Return JSON in this exact shape:
{
  "name": "short plan name",
  "days": [
    {
      "title": "Day 1: Upper body",
      "exercises": [
        { "exerciseId": "id from the list", "sets": [{ "reps": 8, "weightKg": 40 }] }
      ]
    }
  ]
}`

    let raw: unknown
    try {
        raw = await generatePlanJson(prompt, system)
    } catch (err) {
        // Log the real error on the server; the user sees a friendly message
        console.error('Plan generation failed:', err)
        return { ok: false, error: 'The plan could not be generated. Please try again.' }
    }

    const result = generatedPlanSchema.safeParse(raw)
    if (!result.success) {
        return { ok: false, error: 'The plan format was invalid. Please regenerate.' }
    }

    // Reject any exercise ID the AI invented, and attach names for the preview
    const nameById = new Map(exercises.map((e) => [e.id, e.name]))
    const plan: EnrichedPlan = {
        name: result.data.name,
        days: result.data.days
            .map((day) => ({
                title: day.title,
                exercises: day.exercises
                    .filter((ex) => nameById.has(ex.exerciseId))
                    .map((ex) => ({
                        exerciseId: ex.exerciseId,
                        name: nameById.get(ex.exerciseId)!,
                        sets: ex.sets,
                    })),
            }))
            .filter((day) => day.exercises.length > 0),
    }

    if (plan.days.length === 0) {
        return { ok: false, error: 'No valid exercises were found. Please regenerate.' }
    }

    return { ok: true, plan }
}

export async function savePlan(
    plan: EnrichedPlan
): Promise<{ ok: false; error: string } | void> {
    const session = await getSession()
    if (!session) return { ok: false, error: 'Please log in again.' }

    // Validate again on save, since the client could have changed the data
    const check = generatedPlanSchema.safeParse({
        name: plan.name,
        days: plan.days.map((d) => ({
            title: d.title,
            exercises: d.exercises.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets })),
        })),
    })
    if (!check.success) return { ok: false, error: 'This plan is invalid.' }

    // Confirm every exercise exists before creating anything
    const ids = plan.days.flatMap((d) => d.exercises.map((e) => e.exerciseId))
    const found = await db.exercise.count({ where: { id: { in: ids } } })
    const uniqueIds = new Set(ids).size
    if (found !== uniqueIds) return { ok: false, error: 'Some exercises no longer exist.' }

    // Schedule one workout per day, starting tomorrow at 6 PM, one day apart
    const start = new Date()
    start.setDate(start.getDate() + 1)
    start.setHours(18, 0, 0, 0)

    await db.$transaction(
        plan.days.map((day, i) =>
            db.workout.create({
                data: {
                    userId: session.userId,
                    title: day.title,
                    status: 'PENDING',
                    scheduledAt: new Date(start.getTime() + i * 24 * 60 * 60 * 1000),
                    exercises: {
                        create: day.exercises.map((ex, position) => ({
                            exerciseId: ex.exerciseId,
                            position,
                            sets: {
                                create: ex.sets.map((s, n) => ({
                                    setNumber: n + 1,
                                    reps: s.reps,
                                    weightKg: s.weightKg,
                                })),
                            },
                        })),
                    },
                },
            })
        )
    )

    revalidatePath('/workouts')
    redirect('/workouts')
}