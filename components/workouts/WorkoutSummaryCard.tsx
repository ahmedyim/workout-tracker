'use client'

import { useState, useTransition } from 'react'
import { TrendingUp, Pause, Target, Sparkles } from 'lucide-react'
import { generateWorkoutSummary, } from '@/app/(app)/workouts/summary-actions'
import type { WorkoutSummary } from '@/lib/ai/summarySchema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function WorkoutSummaryCard({
    workoutId,
    initial,
}: {
    workoutId: string
    initial: WorkoutSummary | null
}) {
    const [summary, setSummary] = useState<WorkoutSummary | null>(initial)
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    function generate() {
        setError(null)
        startTransition(async () => {
            const res = await generateWorkoutSummary(workoutId)
            if (res.ok) setSummary(res.summary)
            else setError(res.error)
        })
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Session summary
                    </CardTitle>
                    <CardDescription>AI analysis of this workout compared with your recent sessions</CardDescription>
                </div>
                <Button variant="outline" onClick={generate} disabled={pending}>
                    {pending ? 'Analyzing…' : summary ? 'Regenerate' : 'Generate summary'}
                </Button>
            </CardHeader>

            <CardContent className="space-y-5">
                {error && <p className="text-sm text-destructive">{error}</p>}

                {!summary && !pending && !error && (
                    <p className="text-sm text-muted-foreground">
                        Finish this workout to generate a summary.
                    </p>
                )}

                {summary && (
                    <>
                        <p className="rounded-xl bg-primary/5 p-4 font-medium">{summary.headline}</p>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <Section icon={TrendingUp} title="What improved" items={summary.improved} tone="text-emerald-500" />
                            <Section icon={Pause} title="What stalled" items={summary.stalled} tone="text-amber-500" />
                            <Section icon={Target} title="Focus next" items={summary.focusNext} tone="text-primary" />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

function Section({
    icon: Icon,
    title,
    items,
    tone,
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    items: string[]
    tone: string
}) {
    return (
        <div className="space-y-2 rounded-2xl border p-4">
            <p className={`flex items-center gap-2 text-sm font-semibold ${tone}`}>
                <Icon className="h-4 w-4" />
                {title}
            </p>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
            ) : (
                <ul className="space-y-1.5 text-sm">
                    {items.map((item, i) => (
                        <li key={i}>• {item}</li>
                    ))}
                </ul>
            )}
        </div>
    )
}