// Purpose: the logged-in home screen with quick actions, key numbers, and upcoming sessions.
import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BarChart3, Dumbbell, ListChecks, Plus, Sparkles } from 'lucide-react'
import { getUserId } from '@/lib/data/dashboard'
import StatsCards from '@/components/dashboard/StatsCards'
import WeeklyVolume from '@/components/dashboard/WeeklyVolume'
import UpcomingWorkouts from '@/components/dashboard/UpcomingWorkouts'
import { cn } from '@/lib/utils'

const QUICK_ACTIONS = [
    {
        href: '/workouts/new',
        label: 'New workout',
        description: 'Log a session now',
        icon: Plus,
        tone: 'primary',
    },
    {
        href: '/plans/new',
        label: 'Generate plan',
        description: 'Build a week with AI',
        icon: Sparkles,
        tone: 'violet',
    },
    {
        href: '/reports',
        label: 'Reports',
        description: 'See your progress',
        icon: BarChart3,
        tone: 'emerald',
    },
    {
        href: '/exercises',
        label: 'Exercises',
        description: 'Browse your library',
        icon: ListChecks,
        tone: 'amber',
    },
] as const

const TONES = {
    primary: { bg: 'bg-primary/10', text: 'text-primary', ring: 'group-hover:ring-primary/30' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', ring: 'group-hover:ring-violet-500/30' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', ring: 'group-hover:ring-emerald-500/30' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', ring: 'group-hover:ring-amber-500/30' },
} as const

export default function DashboardPage() {
    return (
        <div className="mx-auto max-w-6xl space-y-8">
            {/* Hero: greeting and quick actions, no border */}
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
                <Dumbbell
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 rotate-12 text-primary/10"
                />

                <div className="relative space-y-6">
                    <div className="space-y-2">
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                            Your training
                        </span>
                        <h1 className="text-3xl font-bold tracking-tight text-brand-gradient sm:text-4xl">
                            Welcome back
                        </h1>
                        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                            Here is how your training is going. Keep the streak alive.
                        </p>
                    </div>

                    {/* Quick action tiles */}
                    <nav className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {QUICK_ACTIONS.map((action) => {
                            const Icon = action.icon
                            const tone = TONES[action.tone]
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className={cn(
                                        'group flex flex-col gap-3 rounded-2xl border border-transparent bg-background/80 p-4 shadow-sm ring-1 ring-transparent backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-md',
                                        tone.ring
                                    )}
                                >
                                    <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tone.bg)}>
                                        <Icon className={cn('h-5 w-5', tone.text)} />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold">{action.label}</span>
                                        <span className="block text-xs text-muted-foreground">{action.description}</span>
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </header>

            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
        </div>
    )
}

// Session check and data reads happen per request, inside Suspense
async function DashboardContent() {
    const userId = await getUserId()
    if (!userId) redirect('/login')

    return (
        <>
            {/* Key numbers */}
            <section className="space-y-4">
                <SectionTitle title="Overview" subtitle="Your key numbers at a glance" />
                <StatsCards userId={userId} />
            </section>

            {/* Chart (wide) and upcoming list (narrow) */}
            <section className="space-y-4">
                <SectionTitle title="This week" subtitle="Training volume and what is next" />
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <WeeklyVolume userId={userId} />
                    </div>
                    <UpcomingWorkouts userId={userId} />
                </div>
            </section>
        </>
    )
}

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

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted/60" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="h-72 animate-pulse rounded-2xl bg-muted/60 lg:col-span-2" />
                <div className="h-72 animate-pulse rounded-2xl bg-muted/60" />
            </div>
        </div>
    )
}