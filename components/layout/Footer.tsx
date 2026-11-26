import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import Logo from '@/components/brand/Logo'
import { cn } from '@/lib/utils'

const columns = [
    {
        title: 'Product',
        links: [
            { href: '#features', label: 'Features' },
            { href: '#how-it-works', label: 'How it works' },
            { href: '/dashboard', label: 'Dashboard' },
        ],
    },
    {
        title: 'Account',
        links: [
            { href: '/login', label: 'Log in' },
            { href: '/signup', label: 'Sign up' },
        ],
    },
    {
        title: 'Company',
        links: [
            { href: '#faq', label: 'FAQ' },
            { href: 'mailto:hello@laytech.example', label: 'Contact' },
        ],
    },
]

// Static year on purpose: a date computed during render can differ between server and browser
const YEAR = 2026

export default function Footer() {
    return (
        // Solid brand-dark background, fixed colors so it looks the same in light and dark mode
        <footer className="relative overflow-hidden bg-zinc-950 text-zinc-400">
            {/* Subtle gold glow, echoing the logo */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl"
            />

            <div className="relative mx-auto max-w-6xl px-6 pb-8 pt-20">
                <div className="grid gap-12 lg:grid-cols-12">
                    {/* Brand and contact */}
                    <div className="space-y-6 lg:col-span-5">
                        <Logo />
                        <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
                            Plan workouts, track progress, and review your results, all in one place.
                        </p>

                        <Link
                            href="mailto:hello@laytech.example"
                            className="group inline-flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 transition-all hover:-translate-y-0.5 hover:bg-white/10"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                                <Mail className="h-4 w-4" />
                            </span>
                            <span className="text-left">
                                <span className="block text-[11px] uppercase tracking-wider text-zinc-500">
                                    Get in touch
                                </span>
                                <span className="block text-sm font-medium text-zinc-100">
                                    laytech2755@gmail.com
                                </span>
                            </span>
                            <ArrowUpRight className="ml-2 h-4 w-4 text-zinc-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-400" />
                        </Link>
                    </div>

                    {/* Link columns */}
                    <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
                        {columns.map((col) => (
                            <div key={col.title} className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                                    {col.title}
                                </h3>
                                <ul className="space-y-3">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className={cn(
                                                    'group inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-white'
                                                )}
                                            >
                                                <span className="h-px w-0 bg-amber-400 transition-all duration-300 group-hover:w-3" />
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 pb-8 pt-6 text-xs text-zinc-500 sm:flex-row">
                <p>© {YEAR} LayTech. All rights reserved.</p>
                <p className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Built for consistent training
                </p>
            </div>
        </footer>
    )
}