
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Workout Tracker',
    description: 'Plan, log, and review your training.',
    applicationName: 'Workout Tracker',
    appleWebApp: {
        capable: true,
        title: 'Workouts',
        statusBarStyle: 'black-translucent',
    },
    icons: {
        apple: '/icons/apple-touch-icon.png',
    },
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover', // lets content extend under the iPhone notch
    themeColor: '#0a0a0a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
                {children}
                <ServiceWorkerRegister />
            </body>
        </html>
    )
}