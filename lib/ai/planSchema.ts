import { z } from 'zod'

export const planInputSchema = z.object({
    goal: z.enum(['STRENGTH', 'MUSCLE_GAIN', 'FAT_LOSS']),
    daysPerWeek: z.number().int().min(2).max(6),
    equipment: z.array(z.string()).min(1),
    experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
})

// The shape Claude must return. Validating it stops malformed output from reaching the database.
export const generatedPlanSchema = z.object({
    name: z.string().min(1).max(80),
    days: z
        .array(
            z.object({
                title: z.string().min(1).max(60),
                exercises: z
                    .array(
                        z.object({
                            exerciseId: z.string(),
                            sets: z
                                .array(
                                    z.object({
                                        reps: z.number().int().min(1).max(100),
                                        weightKg: z.number().min(0).max(1000),
                                    })
                                )
                                .min(1)
                                .max(8),
                        })
                    )
                    .min(1)
                    .max(10),
            })
        )
        .min(1)
        .max(6),
})

export type PlanInput = z.infer<typeof planInputSchema>
export type GeneratedPlan = z.infer<typeof generatedPlanSchema>