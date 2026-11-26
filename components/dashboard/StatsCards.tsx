import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getWeeklyStats, getUpcomingWorkouts } from '@/lib/data/dashboard'

export default async function StatsCards({ userId }: { userId: string }) {
  const [weekly, upcoming] = await Promise.all([
    getWeeklyStats(userId),
    getUpcomingWorkouts(userId),
  ])

  const next = upcoming.workouts[0]
  const nextLabel = next
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: upcoming.timezone,
      }).format(next.scheduledAt)
    : 'Nothing scheduled'

  const stats = [
    { label: 'Workouts this week', value: weekly.completed, hint: 'Completed sessions' },
    { label: 'Volume this week', value: `${weekly.totalVolume.toLocaleString()} kg`, hint: 'Reps × weight' },
    { label: 'Upcoming', value: upcoming.workouts.length, hint: 'Pending or active' },
    { label: 'Next session', value: nextLabel, hint: next?.title ?? 'Plan one to get started' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardDescription>{s.label}</CardDescription>
            <CardTitle className="text-2xl">{s.value}</CardTitle>
          </CardHeader>
          <p className="px-6 pb-4 text-xs text-muted-foreground">{s.hint}</p>
        </Card>
      ))}
    </div>
  )
}