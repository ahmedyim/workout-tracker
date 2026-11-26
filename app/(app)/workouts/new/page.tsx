// Purpose: the static shell (heading) prerenders immediately. The session check
// and the exercise list load inside Suspense, because they read cookies and
// that only works at request time.
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getExerciseCatalog } from '@/lib/data/exercises'
import WorkoutForm from '@/components/workouts/WorkoutForm'
import { createWorkout } from '@/actions/workouts'

export default function NewWorkoutPage() {
    return (
        <main className="mx-auto max-w-3xl space-y-6 p-6">
            <h1 className="text-3xl font-bold text-brand-gradient">New workout</h1>
            <Suspense fallback={<p className="text-muted-foreground">Loading form…</p>}>
                <NewWorkoutForm />
            </Suspense>
        </main>
    )
}

async function NewWorkoutForm() {
    const session = await getSession()
    if (!session) redirect('/login')

    const exercises = await getExerciseCatalog()
    return <WorkoutForm exercises={exercises} action={createWorkout} />
}