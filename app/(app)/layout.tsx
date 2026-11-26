// app/(app)/layout.tsx
import { Suspense } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import MobileMenu from '@/components/layout/MobileNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Placeholder keeps the same width while the client component loads */}
            <Suspense fallback={<div className="hidden w-64 shrink-0 md:block" />}>
                <Sidebar />
            </Suspense>

            <div className="flex min-w-0 flex-1 flex-col">
                <Suspense fallback={<div className="h-14 md:hidden" />}>
                    <MobileMenu />
                </Suspense>

                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}