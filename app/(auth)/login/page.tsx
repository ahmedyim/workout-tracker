import Logo from '@/components/brand/Logo'
import AuthForm from '@/components/auth/AuthForm'
import { login } from '@/actions/auth'

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex justify-center"><Logo /></div>
                <h1 className="text-center text-2xl font-bold">Log in</h1>
                <AuthForm
                    action={login}
                    submitLabel="Log in"
                    footer={{ text: "Don't have an account?", href: '/signup', linkText: 'Sign up' }}
                />
            </div>
        </main>
    )
}