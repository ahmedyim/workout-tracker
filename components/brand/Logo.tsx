import Image from 'next/image'
import Link from 'next/link'

export default function Logo({ href = '/', className }: { href?: string; className?: string }) {
    return (
        <Link href={href} className={`flex items-center gap-2 ${className ?? ''}`}>
            <Image src="/laytech-icon.svg" alt="" width={36} height={36} priority />
            <span className="text-xl font-bold text-brand-gradient">LayTech</span>
        </Link>
    )
}