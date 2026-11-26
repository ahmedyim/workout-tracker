
// Purpose: the exercise list is the same for every user, so it is cached.
// This is the only "use cache" in the app that is safe to share.
import { cacheLife, cacheTag } from 'next/cache'
import { db } from '@/lib/db'

export async function getExerciseCatalog() {
    'use cache'
    cacheLife('days')
    cacheTag('exercises')

    return db.exercise.findMany({
        orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, muscleGroup: true, category: true },
    })
}