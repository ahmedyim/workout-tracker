import { cache } from 'react'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

const DAY = 24 * 60 * 60 * 1000

// Reads the session once per request, however many components call it
export const getUserId = cache(async () => {
    const session = await getSession()
    return session?.userId ?? null
})

export const getWeeklyStats = cache(async (userId: string) => {
    const since = new Date(Date.now() - 7 * DAY)

    // Run both queries in parallel to avoid a waterfall
    const [completed, sets] = await Promise.all([
        db.workout.count({
            where: { userId, status: 'COMPLETED', completedAt: { gte: since } },
        }),
        db.exerciseSet.findMany({
            where: {
                completed: true,
                workoutExercise: { workout: { userId, completedAt: { gte: since } } },
            },
            select: {
                reps: true,
                weightKg: true,
                workoutExercise: {
                    select: { workout: { select: { completedAt: true } } },
                },
            },
        }),
    ])

    // One bucket per day, oldest first
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * DAY)
        return {
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            key: d.toDateString(),
            volume: 0,
        }
    })

    for (const set of sets) {
        const key = set.workoutExercise.workout.completedAt?.toDateString()
        const day = days.find((d) => d.key === key)
        if (day) day.volume += set.reps * Number(set.weightKg)
    }

    const totalVolume = days.reduce((sum, d) => sum + d.volume, 0)
    return { completed, totalVolume: Math.round(totalVolume), days }
})

export const getUpcomingWorkouts = cache(async (userId: string) => {
    const [user, workouts] = await Promise.all([
        db.user.findUnique({ where: { id: userId }, select: { timezone: true } }),
        db.workout.findMany({
            where: {
                userId,
                status: { in: ['PENDING', 'ACTIVE'] },
                scheduledAt: { gte: new Date() },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
            select: {
                id: true,
                title: true,
                status: true,
                scheduledAt: true,
                _count: { select: { exercises: true } },
            },
        }),
    ])

    return { timezone: user?.timezone ?? 'UTC', workouts }
})