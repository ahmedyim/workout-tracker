// Zod schema shared by the action and the form
// Purpose: one Zod schema shared by the server action. The server validates
// every field, so the client's values are never trusted.
import { z } from 'zod'

export const SetSchema = z.object({
    reps: z.coerce.number().int().min(1).max(500),
    weightKg: z.coerce.number().min(0).max(1000),
})

export const WorkoutExerciseSchema = z.object({
    exerciseId: z.string().min(1),
    sets: z.array(SetSchema).min(1, 'Add at least one set').max(20),
})

export const CreateWorkoutSchema = z.object({
    title: z.string().trim().min(1, 'Give the workout a title').max(80),
    scheduledAt: z.coerce.date(),
    exercises: z.array(WorkoutExerciseSchema).min(1, 'Add at least one exercise').max(30),
})

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>