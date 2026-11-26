// Purpose: lists upcoming and completed workouts for the logged-in user.
import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarClock, CheckCircle2, ChevronRight, Dumbbell, Plus } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import WorkoutActions from '@/components/workouts/WorkoutActions'
import { cn } from '@/lib/utils'

export default function WorkoutsPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-8">
            {/* Hero header: no border, matching the dashboard and reports */}
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
                <Dumbbell
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rotate-12 text-primary/10"
                />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                            Your sessions
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-brand-gradient sm:text-4xl">
                            Workouts
                        </h1>
                        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                            Plan what is next, and review what you have already finished.
                        </p>
                    </div>
                    <Link
                        href="/workouts/new"
                        className={cn(
                            buttonVariants(),
                            'gap-2 shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5'
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        New workout
                    </Link>
                </div>
            </header>

            <Suspense fallback={<WorkoutsSkeleton />}>
                <WorkoutsList />
            </Suspense>
        </div>
    )
}

// Async child: the session and database reads happen per request, inside Suspense
async function WorkoutsList() {
    const session = await getSession()
    if (!session) redirect('/login')

    // Ownership: the userId filter is always part of every query
    const [user, upcoming, completed] = await Promise.all([
        db.user.findUnique({ where: { id: session.userId }, select: { timezone: true } }),
        db.workout.findMany({
            where: {
                userId: session.userId,
                status: { in: ['PENDING', 'ACTIVE'] },
            },
            orderBy: { scheduledAt: 'asc' },
            select: {
                id: true,
                title: true,
                status: true,
                scheduledAt: true,
                _count: { select: { exercises: true } },
            },
        }),
        db.workout.findMany({
            where: { userId: session.userId, status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' },
            take: 10,
            select: {
                id: true,
                title: true,
                completedAt: true,
                _count: { select: { exercises: true } },
            },
        }),
    ])

    // Format dates in the user's saved time zone, not the server's
    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: user?.timezone ?? 'UTC',
    })

    const exerciseLabel = (n: number) => `${n} ${n === 1 ? 'exercise' : 'exercises'}`

    return (
        <div className="space-y-10">
            {/* Summary strip */}
            <section className="grid gap-4 sm:grid-cols-2">
                <StatTile
                    icon={CalendarClock}
                    label="Upcoming"
                    value={upcoming.length.toString()}
                    tone="primary"
                />
                <StatTile
                    icon={CheckCircle2}
                    label="Recently completed"
                    value={completed.length.toString()}
                    tone="emerald"
                />
            </section>

            {/* Upcoming and active workouts */}
            <section className="space-y-4">
                <SectionTitle title="Upcoming" subtitle="Soonest first" />

                {upcoming.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                                <CalendarClock className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <p className="font-semibold">Nothing planned yet</p>
                            <p className="max-w-xs text-sm text-muted-foreground">
                                Plan your next session to see it here.
                            </p>
                            <Link
                                href="/workouts/new"
                                className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 gap-2')}
                            >
                                <Plus className="h-4 w-4" />
                                Plan a workout
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <ul className="space-y-3">
                        {upcoming.map((w) => (
                            <li key={w.id}>
                                <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex min-w-0 items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                <CalendarClock className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <Link
                                                    href={`/workouts/${w.id}`}
                                                    className="block truncate text-base font-semibold hover:text-primary hover:underline"
                                                >
                                                    {w.title}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatter.format(w.scheduledAt)} · {exerciseLabel(w._count.exercises)}
                                                </p>
                                                <Badge variant={w.status === 'ACTIVE' ? 'default' : 'secondary'} className="capitalize">
                                                    {w.status.toLowerCase()}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="sm:shrink-0">
                                            <WorkoutActions workoutId={w.id} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Completed workouts, most recent first. Open one to see its AI summary. */}
            {completed.length > 0 && (
                <section className="space-y-4">
                    <SectionTitle title="Completed" subtitle="Open a session to see its summary" />
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {completed.map((w) => (
                            <li key={w.id}>
                                <Link
                                    href={`/workouts/${w.id}`}
                                    className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{w.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {w.completedAt ? formatter.format(w.completedAt) : 'Completed'} ·{' '}
                                            {exerciseLabel(w._count.exercises)}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

// Section heading with the same accent bar used on the dashboard
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-primary" />
            <div>
                <h2 className="text-lg font-semibold leading-tight">{title}</h2>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    )
}

const TONES = {
    primary: { bg: 'bg-primary/10', text: 'text-primary' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
} as const

function StatTile({
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
                <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', TONES[tone].bg)}>
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

function WorkoutsSkeleton() {
    return (
        <div className="space-y-10">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
                <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
            </div>
            <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        </div>
    )
}