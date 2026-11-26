'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuthState } from '@/actions/auth'

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>
  submitLabel: string
  footer: { text: string; href: string; linkText: string }
  showPasswordHint?: boolean
}

export default function AuthForm({ action, submitLabel, footer, showPasswordHint }: Props) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={showPasswordHint ? 'new-password' : 'current-password'}
        />
        {state.fieldErrors?.password && (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Please wait…' : submitLabel}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {footer.text}{' '}
        <Link href={footer.href} className="font-medium text-primary hover:underline">
          {footer.linkText}
        </Link>
      </p>
    </form>
  )
}