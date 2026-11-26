import Link from 'next/link'
import { CalendarDays, ClipboardList, Dumbbell, TrendingUp } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const features = [
  {
    icon: ClipboardList,
    title: 'Build workout plans',
    description: 'Combine exercises with sets, reps, and weights in a few clicks.',
  },
  {
    icon: CalendarDays,
    title: 'Schedule sessions',
    description: 'Pick dates and times, and see what is coming up sorted by date.',
  },
  {
    icon: TrendingUp,
    title: 'Track progress',
    description: 'Log completed sets and watch your volume and personal records grow.',
  },
  {
    icon: Dumbbell,
    title: 'Exercise library',
    description: 'Browse a catalog of strength, cardio, and flexibility exercises by muscle group.',
  },
]

const steps = [
  { number: '1', title: 'Create an account', description: 'Sign up in under a minute. No credit card needed.' },
  { number: '2', title: 'Plan your workout', description: 'Add exercises, then set reps, sets, and weights.' },
  { number: '3', title: 'Review your progress', description: 'Check weekly reports and see how you are improving.' },
]

const faqs = [
  {
    question: 'Is LayTech free to use?',
    answer: 'Yes. You can create an account and start planning workouts right away.',
  },
  {
    question: 'Can I schedule workouts ahead of time?',
    answer: 'Yes. Pick a date and time for any workout and it will appear in your upcoming list.',
  },
  {
    question: 'Is my data private?',
    answer: 'Yes. You can only see and edit your own workouts and reports.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-brand-gradient px-6 py-24 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Track every workout. See every gain.
            </h1>
            <p className="mt-6 text-lg text-white/90">
              LayTech helps you plan workouts, schedule sessions, and track your progress
              over time, all in one place.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/signup" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
                Start for free
              </Link>
              <Link
                href="/login"
                className={buttonVariants({
                  size: 'lg',
                  variant: 'outline',
                  className: 'border-white bg-transparent text-white hover:bg-white/10 hover:text-white',
                })}
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-brand-gradient">Everything you need to train smarter</h2>
              <p className="mt-4 text-muted-foreground">
                Simple tools for planning, scheduling, and reviewing your training.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 bg-muted/40 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold text-brand-gradient">How it works</h2>

            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <li key={step.number} className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-lg font-bold text-white">
                    {step.number}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold text-brand-gradient">Frequently asked questions</h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardHeader>
                    <CardTitle className="text-base">{faq.question}</CardTitle>
                    <CardDescription>{faq.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl rounded-2xl bg-brand-gradient p-10 text-center text-white">
            <h2 className="text-3xl font-bold">Ready to start tracking?</h2>
            <p className="mt-4 text-white/90">
              Create your free LayTech account and plan your first workout today.
            </p>
            <Link
              href="/signup"
              className={buttonVariants({ size: 'lg', variant: 'secondary', className: 'mt-8' })}
            >
              Create your account
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}