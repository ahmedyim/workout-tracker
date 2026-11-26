// sign/verify JWT, set/clear cookie

import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-only-secret-change-me')
const COOKIE = 'session'
const WEEK = 60 * 60 * 24 * 7

export async function createSession(userId: string) {
    const token = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(`${WEEK}s`)
        .sign(secret)

    const cookieStore = await cookies()
    cookieStore.set(COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: WEEK,
    })
}

export async function getSession(): Promise<{ userId: string } | null> {
    const token = (await cookies()).get(COOKIE)?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, secret)
        return { userId: String(payload.userId) }
    } catch {
        return null
    }
}

export async function deleteSession() {
    ; (await cookies()).delete(COOKIE)
}