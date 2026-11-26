
// Purpose: fills the Exercise table with a starter catalog. Safe to run
// repeatedly, because upsert matches on the unique name field.
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const exercises = [
    // Strength
    { name: 'Barbell Bench Press', muscleGroup: 'chest', category: 'STRENGTH', description: 'Lie on a flat bench and press a barbell up from the chest.' },
    { name: 'Incline Dumbbell Press', muscleGroup: 'chest', category: 'STRENGTH', description: 'Press dumbbells up on an inclined bench to target the upper chest.' },
    { name: 'Push-Up', muscleGroup: 'chest', category: 'STRENGTH', description: 'Lower and raise your body with hands under the shoulders.' },
    { name: 'Pull-Up', muscleGroup: 'back', category: 'STRENGTH', description: 'Hang from a bar and pull your chin above it.' },
    { name: 'Barbell Row', muscleGroup: 'back', category: 'STRENGTH', description: 'Bend at the hips and row a barbell toward your waist.' },
    { name: 'Lat Pulldown', muscleGroup: 'back', category: 'STRENGTH', description: 'Pull a bar down to your chest on a cable machine.' },
    { name: 'Overhead Press', muscleGroup: 'shoulders', category: 'STRENGTH', description: 'Press a barbell or dumbbells from shoulder height to overhead.' },
    { name: 'Lateral Raise', muscleGroup: 'shoulders', category: 'STRENGTH', description: 'Raise dumbbells out to the sides to shoulder height.' },
    { name: 'Barbell Curl', muscleGroup: 'biceps', category: 'STRENGTH', description: 'Curl a barbell up toward your shoulders.' },
    { name: 'Triceps Pushdown', muscleGroup: 'triceps', category: 'STRENGTH', description: 'Push a cable bar down by extending the elbows.' },
    { name: 'Back Squat', muscleGroup: 'legs', category: 'STRENGTH', description: 'Squat with a barbell across the upper back.' },
    { name: 'Romanian Deadlift', muscleGroup: 'legs', category: 'STRENGTH', description: 'Hinge at the hips with a barbell, keeping the legs nearly straight.' },
    { name: 'Leg Press', muscleGroup: 'legs', category: 'STRENGTH', description: 'Push a weighted platform away with your legs on a machine.' },
    { name: 'Hip Thrust', muscleGroup: 'glutes', category: 'STRENGTH', description: 'Drive the hips up with the upper back on a bench.' },
    { name: 'Plank', muscleGroup: 'core', category: 'STRENGTH', description: 'Hold a straight body position on the forearms and toes.' },

    // Cardio
    { name: 'Treadmill Run', muscleGroup: 'full body', category: 'CARDIO', description: 'Run or jog at a steady pace on a treadmill.' },
    { name: 'Stationary Bike', muscleGroup: 'legs', category: 'CARDIO', description: 'Cycle at a steady or interval pace on an exercise bike.' },
    { name: 'Rowing Machine', muscleGroup: 'full body', category: 'CARDIO', description: 'Row on an ergometer, driving with the legs and pulling with the back.' },
    { name: 'Jump Rope', muscleGroup: 'full body', category: 'CARDIO', description: 'Skip rope continuously at a steady rhythm.' },

    // Flexibility
    { name: 'Hamstring Stretch', muscleGroup: 'legs', category: 'FLEXIBILITY', description: 'Reach toward your toes while seated or standing to stretch the back of the legs.' },
    { name: 'Cat-Cow', muscleGroup: 'back', category: 'FLEXIBILITY', description: 'Move slowly between arching and rounding the spine on all fours.' },
    { name: 'Hip Flexor Stretch', muscleGroup: 'hips', category: 'FLEXIBILITY', description: 'Kneel in a lunge and press the hips forward to stretch the front of the hip.' },
    { name: 'Child\'s Pose', muscleGroup: 'back', category: 'FLEXIBILITY', description: 'Kneel and sit back on the heels with the arms extended forward.' },
] as const

async function main() {
    for (const ex of exercises) {
        await db.exercise.upsert({
            where: { name: ex.name },
            update: { description: ex.description, muscleGroup: ex.muscleGroup, category: ex.category },
            create: ex,
        })
    }
    console.log(`Seeded ${exercises.length} exercises`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => db.$disconnect())