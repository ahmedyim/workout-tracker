// Purpose: Client Component with the complete and delete buttons for one workout.
// Calls Server Actions inside a transition so the UI stays responsive.
'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { completeWorkout, deleteWorkout } from '@/actions/workouts'

export default function WorkoutActions({ workoutId }: { workoutId: string }) {
    const [pending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    function onComplete() {
        setError(null)
        startTransition(async () => {
            const result = await completeWorkout(workoutId)
            if (result.error) setError(result.error)
        })
    }

    function onDelete() {
        if (!window.confirm('Delete this workout? This cannot be undone.')) return
        setError(null)
        startTransition(async () => {
            try {
                await deleteWorkout(workoutId)
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Could not delete workout')
            }
        })
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Button size="sm" onClick={onComplete} disabled={pending}>
                    Mark complete
                </Button>
                <Button size="sm" variant="outline" onClick={onDelete} disabled={pending}>
                    Delete
                </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    )
}