export default function Loading() {
    return (
        <div className="mx-auto max-w-6xl animate-pulse space-y-8 p-6">
            <div className="h-10 w-48 rounded bg-muted" />
            <div className="grid gap-4 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-28 rounded-xl bg-muted" />
                ))}
            </div>
        </div>
    )
}
