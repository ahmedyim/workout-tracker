import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next()
    }

    const token = request.cookies.get('session')?.value
    if (!token) {
        const url = new URL('/login', request.url)
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/workouts/:path*', '/reports/:path*'],
}