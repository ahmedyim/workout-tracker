// 'use server': signup, login, logout
// actions/auth.ts
'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth/session'
import { SignupSchema, LoginSchema } from '@/lib/validations/auth'

export type AuthState = { error?: string; fieldErrors?: Record<string, string> }

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
    const parsed = SignupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!parsed.success) {
        return { fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])) }
    }

    const { email, password } = parsed.data
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return { error: 'An account with this email already exists' }

    const user = await db.user.create({
        data: { email, password: await bcrypt.hash(password, 12) },
    })

    await createSession(user.id)
    redirect('/dashboard')
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
    const parsed = LoginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!parsed.success) return { error: 'Enter your email and password' }

    const { email, password } = parsed.data
    const user = await db.user.findUnique({ where: { email } })

    // Same message for unknown email and wrong password, so attackers can't tell which
    const valid = user && (await bcrypt.compare(password, user.password))
    if (!user || !valid) return { error: 'Invalid email or password' }

    await createSession(user.id)
    redirect('/dashboard')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}