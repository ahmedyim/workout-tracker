// server component
import Logo from '@/components/brand/Logo'
import AuthForm from '@/components/auth/AuthForm'
import { signup } from '@/actions/auth'

export default function SignupPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex justify-center"><Logo /></div>
                <h1 className="text-center text-2xl font-bold">Create your account</h1>
                <AuthForm
                    action={signup}
                    submitLabel="Sign up"
                    showPasswordHint
                    footer={{ text: 'Already have an account?', href: '/login', linkText: 'Log in' }}
                />
            </div>
        </main>
    )
}