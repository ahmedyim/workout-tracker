export default function ComingSoon({ title }: { title: string }) {
    return (
        <main className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-6 text-center">
            <h1 className="text-3xl font-bold text-brand-gradient">{title}</h1>
            <p className="text-muted-foreground">Coming soon</p>
        </main>
    )
}