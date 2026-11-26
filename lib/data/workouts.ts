
// Purpose: 'use server' function that saves a workout. It runs on the server,
// so it re-checks login, validates input, and stores the owner from the session.
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { CreateWorkoutSchema } from '@/lib/validations/workouts'

export type WorkoutState = { error?: string; fieldErrors?: Record<string, string> }

export async function createWorkout(_prev: WorkoutState, formData: FormData): Promise<WorkoutState> {
    // 1. Authentication: never trust the client to say who it is
    const session = await getSession()
    if (!session) return { error: 'Please log in again' }

    // 2. Parse the JSON payload the client form builds
    let raw: unknown
    try {
        raw = JSON.parse(String(formData.get('payload') ?? ''))
    } catch {
        return { error: 'Invalid form data' }
    }

    // 3. Validate every field on the server
    const parsed = CreateWorkoutSchema.safeParse({
        ...(raw as object),
    })
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? 'Check your workout details' }
    }
    const { title, scheduledAt, exercises } = parsed.data

    // 4. Confirm every exercise exists, so a forged ID can't be stored
    const ids = exercises.map((e) => e.exerciseId)
    const found = await db.exercise.findMany({ where: { id: { in: ids } }, select: { id: true } })
    if (found.length !== new Set(ids).size) {
        return { error: 'One of the exercises no longer exists' }
    }

    // 5. Write with the owner set from the session, not from the form
    await db.workout.create({
        data: {
            userId: session.userId,
            title,
            scheduledAt,
            status: 'PENDING',
            exercises: {
                create: exercises.map((ex, position) => ({
                    exerciseId: ex.exerciseId,
                    position,
                    sets: {
                        create: ex.sets.map((s, i) => ({
                            setNumber: i + 1,
                            reps: s.reps,
                            weightKg: s.weightKg,
                        })),
                    },
                })),
            },
        },
    })

    // 6. Refresh the pages that show this data, then navigate
    revalidatePath('/dashboard')
    revalidatePath('/workouts')
    redirect('/workouts')
}