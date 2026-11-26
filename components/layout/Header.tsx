import Link from 'next/link'
import Logo from '@/components/brand/Logo'
import { buttonVariants } from '@/components/ui/button'

const navItems = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#faq', label: 'FAQ' },
]

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                <Logo />

                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Link href="/login" className={buttonVariants({ variant: 'ghost' })}>
                        Log in
                    </Link>
                    <Link href="/signup" className={buttonVariants()}>
                        Get started
                    </Link>
                </div>
            </div>
        </header>
    )
}