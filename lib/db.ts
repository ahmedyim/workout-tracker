
import { PrismaClient } from '@prisma/client'

// In development, Next.js hot reloads modules and could open a new
// database connection on every change. Storing the client on globalThis
// reuses the same instance.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'development') {
  globalForPrisma.prisma = db
}