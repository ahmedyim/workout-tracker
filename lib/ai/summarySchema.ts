import { z } from 'zod'

export const summarySchema = z.object({
    headline: z.string().min(1).max(140),
    improved: z.array(z.string().max(200)).max(5),
    stalled: z.array(z.string().max(200)).max(5),
    focusNext: z.array(z.string().max(200)).min(1).max(3),
})

export type WorkoutSummary = z.infer<typeof summarySchema>