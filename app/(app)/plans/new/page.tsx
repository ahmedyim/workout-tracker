
import PlanGenerator from '@/components/plans/PlanGenerator'

export default function NewPlanPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-brand-gradient">Plan generator</h1>
                <p className="text-muted-foreground">
                    Tell us your goal and we will build a week of training from your exercises.
                </p>
            </header>
            <PlanGenerator />
        </div>
    )
}