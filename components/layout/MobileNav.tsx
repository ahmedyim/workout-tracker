
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
    Menu,
    X,
    LayoutDashboard,
    Dumbbell,
    BarChart3,
    Sparkles,
    ListChecks,
    LogOut,
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { cn } from '@/lib/utils'

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/plans/new', label: 'Generate plan', icon: Sparkles },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/exercises', label: 'Exercises', icon: ListChecks },
]

export default function MobileMenu() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    return (
        <div className="md:hidden">
            {/* Top bar in the normal page flow, so it never covers content */}
            <div className="flex h-14 items-center px-4">
                <button
                    onClick={() => setOpen(!open)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                    className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Dark backdrop, tap to close */}
            <div
                onClick={() => setOpen(false)}
                className={cn(
                    'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
                    open ? 'opacity-100' : 'pointer-events-none opacity-0'
                )}
            />

            {/* Sliding panel from the left */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-background p-4 shadow-xl transition-transform duration-300 ease-in-out',
                    open ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="mb-6 flex h-14 items-center pl-12 text-lg font-bold">Menu</div>

                <nav className="flex flex-col gap-1">
                    {links.map((link) => {
                        const active =
                            pathname === link.href || pathname.startsWith(link.href + '/')
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                                    active
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout pinned to the bottom of the panel, same as the desktop sidebar */}
                <form action={logout} className="mt-auto border-t pt-3">
                    <button
                        type="submit"
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-destructive/10">
                            <LogOut className="h-4 w-4" />
                        </span>
                        Log out
                    </button>
                </form>
            </aside>
        </div>
    )
}