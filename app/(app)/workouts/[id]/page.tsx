// Purpose: shows one workout with its exercises, sets, and an AI summary.
import { Suspense } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import WorkoutSummaryCard from '@/components/workouts/WorkoutSummaryCard'
import { summarySchema } from '@/lib/ai/summarySchema'

export default function WorkoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <Link href="/workouts" className="text-sm text-muted-foreground hover:text-primary">
                ← Back to workouts
            </Link>
            <Suspense fallback={<p className="text-muted-foreground">Loading workout…</p>}>
                <WorkoutDetail params={params} />
            </Suspense>
        </div>
    )
}

async function WorkoutDetail({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params

    // Ownership: the userId filter is in the same query as the id
    const [workout, user] = await Promise.all([
        db.workout.findFirst({
            where: { id, userId: session.userId },
            select: {
                id: true,
                title: true,
                status: true,
                scheduledAt: true,
                completedAt: true,
                aiSummary: true,
                exercises: {
                    orderBy: { position: 'asc' },
                    select: {
                        id: true,
                        exercise: { select: { name: true, muscleGroup: true } },
                        sets: {
                            orderBy: { setNumber: 'asc' },
                            select: { id: true, setNumber: true, reps: true, weightKg: true },
                        },
                    },
                },
            },
        }),
        db.user.findUnique({ where: { id: session.userId }, select: { timezone: true } }),
    ])

    if (!workout) notFound()

    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: user?.timezone ?? 'UTC',
    })

    // The saved summary is stored as JSON, so check its shape before showing it
    const savedSummary = summarySchema.safeParse(workout.aiSummary)

    return (
        <>
            <header className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-bold text-brand-gradient">{workout.title}</h1>
                    <Badge variant="secondary">{workout.status.toLowerCase()}</Badge>
                </div>
                <p className="text-muted-foreground">{formatter.format(workout.scheduledAt)}</p>
            </header>

            {workout.status === 'COMPLETED' && (
                <WorkoutSummaryCard
                    workoutId={workout.id}
                    initial={savedSummary.success ? savedSummary.data : null}
                />
            )}

            {workout.exercises.length === 0 ? (
                <p className="text-muted-foreground">This workout has no exercises.</p>
            ) : (
                workout.exercises.map((we) => {
                    const volume = we.sets.reduce((sum, s) => sum + s.reps * Number(s.weightKg), 0)
                    return (
                        <Card key={we.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">{we.exercise.name}</CardTitle>
                                <CardDescription>
                                    {we.exercise.muscleGroup} · {we.sets.length} sets · {Math.round(volume)} kg total
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-muted-foreground">
                                            <th className="py-2 font-medium">Set</th>
                                            <th className="py-2 font-medium">Reps</th>
                                            <th className="py-2 font-medium">Weight</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {we.sets.map((s) => (
                                            <tr key={s.id} className="border-b last:border-0">
                                                <td className="py-2">{s.setNumber}</td>
                                                <td className="py-2">{s.reps}</td>
                                                <td className="py-2">{Number(s.weightKg)} kg</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    )
                })
            )}
        </>
    )
}