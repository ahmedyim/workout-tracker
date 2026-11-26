// 'use server': create, update, delete, comment

// Purpose: Server Actions for workouts. They run on the server, so each one
// checks the login, validates input with Zod, and only touches rows that
// belong to the logged-in user.
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth/session'
import { CreateWorkoutSchema } from '@/lib/validations/workouts'

export type WorkoutState = { error?: string }

// Creates a workout with its exercises and sets.
// Called from the form with (previousState, formData).
export async function createWorkout(_prev: WorkoutState, formData: FormData): Promise<WorkoutState> {
    // 1. Authentication: the server decides who the user is, from the cookie
    const session = await getSession()
    if (!session) return { error: 'Please log in again' }

    // 2. Read the JSON payload the client form builds
    let raw: unknown
    try {
        raw = JSON.parse(String(formData.get('payload') ?? ''))
    } catch {
        return { error: 'Invalid form data' }
    }

    // 3. Validate every field on the server
    const parsed = CreateWorkoutSchema.safeParse(raw)
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? 'Check your workout details' }
    }
    const { title, scheduledAt, exercises } = parsed.data

    // 4. Confirm every exercise exists, so a forged ID is never stored
    const ids = [...new Set(exercises.map((e) => e.exerciseId))]
    const found = await db.exercise.findMany({
        where: { id: { in: ids } },
        select: { id: true },
    })
    if (found.length !== ids.length) {
        return { error: 'One of the exercises no longer exists' }
    }

    // 5. Save. The owner comes from the session, never from the form.
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

    // 6. Refresh the pages that show workouts, then navigate.
    // redirect() throws internally, so it must stay outside any try block.
    revalidatePath('/dashboard')
    revalidatePath('/workouts')
    redirect('/workouts')
}

// Deletes one workout. The userId filter in the same query means a user
// can only delete their own workouts, even if they guess another ID.
export async function deleteWorkout(workoutId: string) {
    const session = await getSession()
    if (!session) throw new Error('Not signed in')

    const result = await db.workout.deleteMany({
        where: { id: workoutId, userId: session.userId },
    })
    if (result.count === 0) throw new Error('Workout not found')

    revalidatePath('/dashboard')
    revalidatePath('/workouts')
}

// Marks a workout as completed. Ownership is checked in the same query.
export async function completeWorkout(workoutId: string): Promise<WorkoutState> {
    const session = await getSession()
    if (!session) return { error: 'Please log in again' }

    const result = await db.workout.updateMany({
        where: { id: workoutId, userId: session.userId },
        data: { status: 'COMPLETED', completedAt: new Date() },
    })
    if (result.count === 0) return { error: 'Workout not found' }

    revalidatePath('/dashboard')
    revalidatePath('/workouts')
    return {}
}