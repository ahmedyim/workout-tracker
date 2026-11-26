import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUpcomingWorkouts } from '@/lib/data/dashboard'

export default async function UpcomingWorkouts({ userId }: { userId: string }) {
    const { workouts, timezone } = await getUpcomingWorkouts(userId)
    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: timezone,
    })

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Your next scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent>
                {workouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No workouts scheduled.{' '}
                        <Link href="/workouts/new" className="font-medium text-primary hover:underline">
                            Plan one now
                        </Link>
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {workouts.map((w) => (
                            <li key={w.id}>
                                <Link
                                    href={`/workouts/${w.id}`}
                                    className="flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                >
                                    <div>
                                        <p className="font-medium">{w.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatter.format(w.scheduledAt)} · {w._count.exercises} exercises
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{w.status.toLowerCase()}</Badge>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}