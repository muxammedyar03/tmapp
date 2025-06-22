import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 10)

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      fullName: "Demo User",
    },
  })

  // Create default categories for demo user
  const categories = [
    {name: 'Работа', color: '#EF4444', icon: '💼'},
    {name: 'Учеба', color: '#10B981', icon: '📚'},
    {name: 'Спорт', color: '#F59E0B', icon: '🏃'},
    {name: 'Отдых', color: '#8B5CF6', icon: '🎮'},
    {name: 'Обед', color: '#6B7280', icon: '🍽️'},
    {name: 'Другое', color: '#3B82F6', icon: '❓'}
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: category.name,
        },
      },
      update: {},
      create: {
        userId: user.id,
        ...category,
      },
    })
  }

  console.log("Seed data created successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
