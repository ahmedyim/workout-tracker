// Purpose: Client Component for one exercise in the draft. Edits its sets
// (reps and weight) and can add or remove sets or the whole exercise.
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type DraftSet = { reps: number; weightKg: number }
export type DraftExercise = { exerciseId: string; sets: DraftSet[] }

export default function ExerciseRow({
    exercise,
    value,
    onChange,
    onRemove,
}: {
    exercise?: { name: string; muscleGroup: string }
    value: DraftExercise
    onChange: (next: DraftExercise) => void
    onRemove: () => void
}) {
    function updateSet(i: number, patch: Partial<DraftSet>) {
        onChange({ ...value, sets: value.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
    }

    return (
        <div className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{exercise?.name ?? 'Exercise'}</p>
                    <p className="text-xs text-muted-foreground">{exercise?.muscleGroup}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
                    Remove
                </Button>
            </div>

            {value.sets.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-12 text-sm text-muted-foreground">Set {i + 1}</span>
                    <Input
                        type="number"
                        className="w-24"
                        value={s.reps}
                        onChange={(e) => updateSet(i, { reps: Number(e.target.value) })}
                        aria-label="Reps"
                    />
                    <span className="text-sm text-muted-foreground">reps ×</span>
                    <Input
                        type="number"
                        step="0.5"
                        className="w-24"
                        value={s.weightKg}
                        onChange={(e) => updateSet(i, { weightKg: Number(e.target.value) })}
                        aria-label="Weight in kg"
                    />
                    <span className="text-sm text-muted-foreground">kg</span>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ ...value, sets: [...value.sets, { reps: 10, weightKg: value.sets.at(-1)?.weightKg ?? 20 }] })}
            >
                Add set
            </Button>
        </div>
    )
}