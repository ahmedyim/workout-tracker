import { connection } from 'next/server'
import { BarChart3 } from 'lucide-react'
import { db } from '@/lib/db'
import { cn } from '@/lib/utils'

const DAY = 24 * 60 * 60 * 1000

// Reading the clock is only allowed at request time. connection() marks this
// render as dynamic first, so the value is never prerendered or cached.
async function getNow() {
    await connection()
    return Date.now()
}

export default async function WeeklyVolume({ userId }: { userId: string }) {
    const now = await getNow()

    const [user, workouts] = await Promise.all([
        db.user.findUnique({ where: { id: userId }, select: { timezone: true } }),
        db.workout.findMany({
            where: {
                userId,
                status: 'COMPLETED',
                completedAt: { gte: new Date(now - 7 * DAY) },
            },
            select: {
                completedAt: true,
                exercises: { select: { sets: { select: { reps: true, weightKg: true } } } },
            },
        }),
    ])

    const timeZone = user?.timezone ?? 'UTC'
    // "en-CA" formats dates as YYYY-MM-DD, which gives a reliable grouping key
    const dayKey = (d: Date) => d.toLocaleDateString('en-CA', { timeZone })

    // The last 7 days, oldest first
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now - (6 - i) * DAY)
        return {
            key: dayKey(date),
            label: date.toLocaleDateString('en-US', { weekday: 'short', timeZone }),
            volume: 0,
        }
    })
    const byKey = new Map(days.map((d) => [d.key, d]))

    for (const w of workouts) {
        if (!w.completedAt) continue
        const day = byKey.get(dayKey(w.completedAt))
        if (!day) continue
        for (const we of w.exercises) {
            for (const s of we.sets) day.volume += s.reps * Number(s.weightKg)
        }
    }

    const total = days.reduce((sum, d) => sum + d.volume, 0)
    const max = Math.max(...days.map((d) => d.volume), 1)

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-semibold">Weekly volume</h3>
                    <p className="text-xs text-muted-foreground">Reps × kg for the last 7 days</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-primary">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-semibold tabular-nums">
                        {Math.round(total).toLocaleString()} kg
                    </span>
                </div>
            </div>

            {total === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
                    <p className="font-medium">No training in the last 7 days</p>
                    <p className="text-sm text-muted-foreground">Finish a workout and your volume will appear here.</p>
                </div>
            ) : (
                <div className="flex h-48 items-end gap-3">
                    {days.map((d) => {
                        const height = Math.max((d.volume / max) * 100, d.volume > 0 ? 6 : 2)
                        return (
                            <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                                <span className="text-[11px] tabular-nums text-muted-foreground">
                                    {d.volume > 0 ? Math.round(d.volume).toLocaleString() : ''}
                                </span>
                                <div
                                    className={cn(
                                        'w-full rounded-t-xl bg-gradient-to-t from-primary to-primary/50 transition-all',
                                        d.volume === 0 && 'bg-muted'
                                    )}
                                    style={{ height: `${height}%` }}
                                />
                                <span className="text-xs text-muted-foreground">{d.label}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}