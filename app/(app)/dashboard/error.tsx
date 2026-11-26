'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <main className="mx-auto flex max-w-md flex-col items-center gap-4 p-10 text-center">
            <h2 className="text-2xl font-bold">Something went wrong</h2>
            <p className="text-muted-foreground">
                We could not load your dashboard. Please try again.
            </p>
            <Button onClick={() => reset()}>Try again</Button>
        </main>
    )
}