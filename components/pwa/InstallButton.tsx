'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> }

export default function InstallButton() {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferred(e as BeforeInstallPromptEvent)
        }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    if (!deferred) return null

    return (
        <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
                await deferred.prompt()
                setDeferred(null)
            }}
        >
            <Download className="h-4 w-4" />
            Install app
        </Button>
    )
}