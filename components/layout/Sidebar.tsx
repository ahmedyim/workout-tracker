// Purpose: navigation for the logged-in area. Client Component only because it
// reads the current path to highlight the active link. Logout uses the
// logout Server Action in a plain <form>, so no client JavaScript is needed to log out.
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Dumbbell,
    BarChart3,
    ListChecks,
    LogOut,
    Plus,
    Sparkles
} from 'lucide-react'
import Logo from '@/components/brand/Logo'
import { logout } from '@/actions/auth'
import { cn } from '@/lib/utils'

const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/workouts', label: 'Workouts', icon: Dumbbell },
    { href: '/plans/new', label: 'Generate plan', icon: Sparkles },
    { href: '/reports', label: 'Reports', icon: BarChart3 },
    { href: '/exercises', label: 'Exercises', icon: ListChecks },
]
export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-gradient-to-b from-background to-muted/40 p-4 md:flex">
            {/* Brand */}
            <div className="mb-6 px-2 pt-1">
                <Logo href="/dashboard" />
            </div>

            {/* Main action: the thing users do most, so it gets the strongest color */}
            <Link
                href="/workouts/new"
                className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0"
            >
                <Plus className="h-4 w-4" />
                New workout
            </Link>

            {/* Navigation */}
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Menu
            </p>
            <nav className="flex flex-col gap-1">
                {links.map((link) => {
                    // Also highlight /workouts when on /workouts/new or /workouts/[id]
                    const active =
                        pathname === link.href || pathname.startsWith(link.href + '/')
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                                active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            {/* Small bar on the left edge, only for the active page */}
                            {active && (
                                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                            )}

                            {/* Icon in its own rounded box */}
                            <span
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground group-hover:shadow-sm'
                                )}
                            >
                                <link.icon className="h-4 w-4" />
                            </span>
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout pinned to the bottom, separated by a line */}
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
    )
}