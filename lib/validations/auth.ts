import { z } from 'zod'

export const SignupSchema = z.object({
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginSchema = z.object({
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: z.string().min(1, 'Enter your password'),
})