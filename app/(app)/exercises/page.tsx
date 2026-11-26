// Purpose: lists exercises the user can use when planning workouts.
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ExercisesPage() {
    return (
        <div className="mx-auto max-w-4xl space-y-6">
            {/* Static header: no data here, so the page can prerender */}
            <header>
                <h1 className="text-3xl font-bold text-brand-gradient">Exercises</h1>
                <p className="text-muted-foreground">Movements you can add to your workouts.</p>
            </header>

            <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted/60" />}>
                <ExercisesList />
            </Suspense>
        </div>
    )
}

// Async child: the session and database reads happen per request, inside Suspense
async function ExercisesList() {
    const session = await getSession()
    if (!session) redirect('/login')

    const exercises = await db.exercise.findMany({
        orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
        select: { id: true, name: true, muscleGroup: true },
    })

    if (exercises.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                    No exercises yet.
                </CardContent>
            </Card>
        )
    }

    // Group exercises by muscle group for easier scanning
    const groups = exercises.reduce<Record<string, typeof exercises>>((acc, ex) => {
        ; (acc[ex.muscleGroup] ??= []).push(ex)
        return acc
    }, {})

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(groups).map(([group, items]) => (
                <Card key={group}>
                    <CardHeader>
                        <CardTitle className="text-lg capitalize">{group.toLowerCase()}</CardTitle>
                        <CardDescription>
                            {items.length} {items.length === 1 ? 'exercise' : 'exercises'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {items.map((ex) => (
                                <li key={ex.id} className="flex items-center justify-between text-sm">
                                    <span>{ex.name}</span>
                                    <Badge variant="outline">{ex.muscleGroup.toLowerCase()}</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}