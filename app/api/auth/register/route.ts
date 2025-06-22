import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Barcha maydonlar to'ldirilishi kerak" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Parol kamida 6 ta belgidan iborat bo'lishi kerak" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Bu email bilan foydalanuvchi mavjud" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    })

    // Create default categories
    const defaultCategories = [
      {name: 'Работа', color: '#EF4444', icon: '💼'},
      {name: 'Учеба', color: '#10B981', icon: '📚'},
      {name: 'Спорт', color: '#F59E0B', icon: '🏃'},
      {name: 'Отдых', color: '#8B5CF6', icon: '🎮'},
      {name: 'Обед', color: '#6B7280', icon: '🍽️'},
      {name: 'Другое', color: '#3B82F6', icon: '❓'}
    ]

    await prisma.category.createMany({
      data: defaultCategories.map((category) => ({
        userId: user.id,
        ...category,
      })),
    })

    return NextResponse.json({ message: "Foydalanuvchi muvaffaqiyatli yaratildi" })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}
