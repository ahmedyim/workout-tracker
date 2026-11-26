// Purpose: summarizes the logged-in user's completed training.
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Activity, Dumbbell, Layers, TrendingUp, CalendarCheck } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function ReportsPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Hero header */}
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
                <Activity
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-primary/10"
                />
                <div className="relative space-y-2">
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                        Your progress
                    </span>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-gradient sm:text-4xl">
                        Reports
                    </h1>
                    <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                        A summary of everything you have lifted and completed.
                    </p>
                </div>
            </header>

            <Suspense fallback={<ReportsSkeleton />}>
                <ReportsContent />
            </Suspense>
        </div>
    )
}

// Async child: the session and database reads happen per request, inside Suspense
async function ReportsContent() {
    const session = await getSession()
    if (!session) redirect('/login')

    // Ownership: the userId filter is always part of the query
    const workouts = await db.workout.findMany({
        where: { userId: session.userId, status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        select: {
            id: true,
            title: true,
            completedAt: true,
            exercises: {
                select: {
                    exercise: { select: { muscleGroup: true } },
                    sets: { select: { reps: true, weightKg: true } },
                },
            },
        },
    })

    if (workouts.length === 0) {
        return (
            <Card className="overflow-hidden">
                <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                        <Dumbbell className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="font-semibold">No completed workouts yet</p>
                    <p className="max-w-xs text-sm text-muted-foreground">
                        Finish a workout and your totals, muscle balance, and history will show up here.
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Work out totals and volume per muscle group in one pass
    let totalVolume = 0
    let totalSets = 0
    const byMuscle: Record<string, number> = {}

    for (const w of workouts) {
        for (const we of w.exercises) {
            const group = we.exercise.muscleGroup
            for (const s of we.sets) {
                const volume = s.reps * Number(s.weightKg)
                totalVolume += volume
                totalSets += 1
                byMuscle[group] = (byMuscle[group] ?? 0) + volume
            }
        }
    }

    const muscleRows = Object.entries(byMuscle).sort((a, b) => b[1] - a[1])
    const maxVolume = muscleRows[0]?.[1] ?? 1

    return (
        <div className="space-y-8">
            {/* Key numbers */}
            <section className="grid gap-4 sm:grid-cols-3">
                <StatCard
                    icon={CalendarCheck}
                    label="Completed workouts"
                    value={workouts.length.toLocaleString()}
                    tone="primary"
                />
                <StatCard
                    icon={Layers}
                    label="Total sets"
                    value={totalSets.toLocaleString()}
                    tone="violet"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Total volume"
                    value={`${Math.round(totalVolume).toLocaleString()} kg`}
                    tone="emerald"
                />
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Volume by muscle group (wider) */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Volume by muscle group</CardTitle>
                        <CardDescription>Total weight lifted (reps × kg)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {muscleRows.map(([group, volume], i) => {
                            const percent = Math.max(4, (volume / maxVolume) * 100)
                            return (
                                <div key={group} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium capitalize">
                                            {group.toLowerCase()}
                                        </span>
                                        <span className="tabular-nums text-muted-foreground">
                                            {Math.round(volume).toLocaleString()} kg
                                        </span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                'h-full rounded-full bg-gradient-to-r transition-all',
                                                BAR_COLORS[i % BAR_COLORS.length]
                                            )}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                {/* Recent workouts (narrower) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent workouts</CardTitle>
                        <CardDescription>Your last five sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {workouts.slice(0, 5).map((w) => (
                                <li
                                    key={w.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">{w.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {w.completedAt?.toLocaleDateString('en-US', {
                                                dateStyle: 'medium',
                                            })}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className="shrink-0">
                                        {w.exercises.length} ex
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

// Each muscle group bar gets a color from this list, in order
const BAR_COLORS = [
    'from-primary to-primary/60',
    'from-violet-500 to-violet-400',
    'from-emerald-500 to-emerald-400',
    'from-amber-500 to-amber-400',
    'from-rose-500 to-rose-400',
]

const TONES = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
} as const

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    value: string
    tone: keyof typeof TONES
}) {
    return (
        <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
                <div
                    className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                        TONES[tone].bg
                    )}
                >
                    <Icon className={cn('h-6 w-6', TONES[tone].text)} />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold tabular-nums">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function ReportsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/60" />
                ))}
            </div>
            <div className="h-80 animate-pulse rounded-2xl bg-muted/60" />
        </div>
    )
}