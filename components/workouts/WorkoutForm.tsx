// Purpose: Client Component. Holds the draft workout in state, lets the user
// pick exercises, and submits one JSON payload to the server action.
'use client'

import { useActionState, useState, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ExerciseRow, { type DraftExercise } from './ExerciseRow'
import type { WorkoutState } from '@/actions/workouts'

type Catalog = { id: string; name: string; muscleGroup: string; category: string }

// Browser-only default time. The subscribe function never fires because the
// value doesn't change while the page is open.
const noopSubscribe = () => () => { }

export default function WorkoutForm({
    exercises,
    action,
}: {
    exercises: Catalog[]
    action: (state: WorkoutState, formData: FormData) => Promise<WorkoutState>
}) {
    // On the server and during hydration this returns '' so the HTML matches.
    // In the browser it returns tomorrow at 18:00 in the user's local time.
    const defaultScheduledAt = useSyncExternalStore(noopSubscribe, defaultWhen, () => '')

    const [title, setTitle] = useState('')
    // null means "the user hasn't changed the date yet", so use the default
    const [scheduledOverride, setScheduledOverride] = useState<string | null>(null)
    const scheduledAt = scheduledOverride ?? defaultScheduledAt

    const [draft, setDraft] = useState<DraftExercise[]>([])
    const [selectedId, setSelectedId] = useState('')
    const [state, formAction, pending] = useActionState(action, {})

    function addSelected() {
        if (!selectedId) return
        setDraft((d) => [...d, { exerciseId: selectedId, sets: [{ reps: 10, weightKg: 20 }] }])
        setSelectedId('')
    }

    return (
        <form action={formAction} className="space-y-6">
            <input
                type="hidden"
                name="payload"
                value={JSON.stringify({ title, scheduledAt, exercises: draft })}
            />

            {state.error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="title">Workout title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Upper body A"
                        maxLength={80}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="scheduledAt">When</Label>
                    <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledOverride(e.target.value)}
                    />
                </div>
            </div>

            <section className="space-y-4">
                {draft.map((ex, i) => (
                    <ExerciseRow
                        key={i}
                        exercise={exercises.find((e) => e.id === ex.exerciseId)}
                        value={ex}
                        onChange={(next) => setDraft((d) => d.map((x, j) => (j === i ? next : x)))}
                        onRemove={() => setDraft((d) => d.filter((_, j) => j !== i))}
                    />
                ))}

                {exercises.length === 0 ? (
                    <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                        No exercises in the catalog yet. Run <code>npx prisma db seed</code>, then restart the dev server.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                            aria-label="Choose an exercise"
                            className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">Choose an exercise…</option>
                            {exercises.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.muscleGroup}: {e.name}
                                </option>
                            ))}
                        </select>
                        <Button type="button" variant="outline" onClick={addSelected} disabled={!selectedId}>
                            Add exercise
                        </Button>
                    </div>
                )}
            </section>

            <Button type="submit" className="w-full" disabled={pending || draft.length === 0 || !title.trim()}>
                {pending ? 'Saving…' : 'Save workout'}
            </Button>
        </form>
    )
}

// Tomorrow at 18:00 in the browser's local time, formatted for datetime-local.
function defaultWhen() {
    const d = new Date(Date.now() + 86_400_000)
    d.setHours(18, 0, 0, 0)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}