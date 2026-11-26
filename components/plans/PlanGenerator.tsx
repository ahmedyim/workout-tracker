'use client'

import { useState, useTransition } from 'react'
import { generatePlan, savePlan, type EnrichedPlan } from '@/app/(app)/plans/actions'
import type { PlanInput } from '@/lib/ai/planSchema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const GOALS: { value: PlanInput['goal']; label: string }[] = [
    { value: 'STRENGTH', label: 'Strength' },
    { value: 'MUSCLE_GAIN', label: 'Muscle gain' },
    { value: 'FAT_LOSS', label: 'Fat loss' },
]

const LEVELS: { value: PlanInput['experience']; label: string }[] = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
]

const EQUIPMENT = ['Barbell', 'Dumbbells', 'Machine', 'Cable', 'Bodyweight']

export default function PlanGenerator() {
    const [goal, setGoal] = useState<PlanInput['goal']>('MUSCLE_GAIN')
    const [daysPerWeek, setDaysPerWeek] = useState(3)
    const [equipment, setEquipment] = useState<string[]>(['Dumbbells', 'Bodyweight'])
    const [experience, setExperience] = useState<PlanInput['experience']>('BEGINNER')
    const [plan, setPlan] = useState<EnrichedPlan | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    function toggleEquipment(item: string) {
        setEquipment((prev) =>
            prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
        )
    }

    function generate() {
        setError(null)
        startTransition(async () => {
            const res = await generatePlan({ goal, daysPerWeek, equipment, experience })
            if (res.ok) setPlan(res.plan)
            else setError(res.error)
        })
    }

    function removeExercise(dayIndex: number, exIndex: number) {
        setPlan((prev) =>
            prev && {
                ...prev,
                days: prev.days.map((day, i) =>
                    i !== dayIndex
                        ? day
                        : { ...day, exercises: day.exercises.filter((_, j) => j !== exIndex) }
                ),
            }
        )
    }

    function accept() {
        if (!plan) return
        setError(null)
        startTransition(async () => {
            const res = await savePlan(plan)
            if (res && !res.ok) setError(res.error)
        })
    }

    return (
        <div className="space-y-6">
            {/* Inputs */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Your preferences</CardTitle>
                    <CardDescription>We use these to shape your week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium">Goal</legend>
                        <div className="flex flex-wrap gap-2">
                            {GOALS.map((g) => (
                                <Chip key={g.value} active={goal === g.value} onClick={() => setGoal(g.value)}>
                                    {g.label}
                                </Chip>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium">Days per week: {daysPerWeek}</legend>
                        <input
                            type="range"
                            min={2}
                            max={6}
                            value={daysPerWeek}
                            onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </fieldset>

                    <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium">Equipment</legend>
                        <div className="flex flex-wrap gap-2">
                            {EQUIPMENT.map((item) => (
                                <Chip
                                    key={item}
                                    active={equipment.includes(item)}
                                    onClick={() => toggleEquipment(item)}
                                >
                                    {item}
                                </Chip>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium">Experience</legend>
                        <div className="flex flex-wrap gap-2">
                            {LEVELS.map((l) => (
                                <Chip key={l.value} active={experience === l.value} onClick={() => setExperience(l.value)}>
                                    {l.label}
                                </Chip>
                            ))}
                        </div>
                    </fieldset>

                    <Button onClick={generate} disabled={pending || equipment.length === 0}>
                        {pending && !plan ? 'Building your plan…' : 'Generate plan'}
                    </Button>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>
            </Card>

            {/* Preview */}
            {plan && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>Review, remove anything you don&apos;t want, then accept.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {plan.days.map((day, dayIndex) => (
                            <div key={dayIndex} className="space-y-3 rounded-2xl border p-4">
                                <p className="font-semibold">{day.title}</p>
                                <ul className="space-y-2">
                                    {day.exercises.map((ex, exIndex) => (
                                        <li key={`${ex.exerciseId}-${exIndex}`} className="flex items-center justify-between gap-3 text-sm">
                                            <span>
                                                {ex.name}
                                                <span className="ml-2 text-muted-foreground">
                                                    {ex.sets.length} × {ex.sets[0].reps}
                                                    {ex.sets[0].weightKg > 0 && ` @ ${ex.sets[0].weightKg} kg`}
                                                </span>
                                            </span>
                                            <button
                                                onClick={() => removeExercise(dayIndex, exIndex)}
                                                className="text-xs text-muted-foreground hover:text-destructive"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={accept} disabled={pending}>
                                {pending ? 'Saving…' : 'Accept plan'}
                            </Button>
                            <Button variant="outline" onClick={generate} disabled={pending}>
                                Regenerate
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function Chip({
    active,
    onClick,
    children,
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={
                active
                    ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground'
                    : 'rounded-full border px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted'
            }
        >
            {children}
        </button>
    )
}