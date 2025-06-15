import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get start of current week (Monday)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfWeek,
        },
        duration: {
          not: null,
        },
      },
      include: { category: true },
    })

    // Process statistics
    const categoryStats = new Map()
    let totalTime = 0
    let workStudyTime = 0

    timeEntries.forEach((entry) => {
      const duration = entry.duration || 0
      totalTime += duration

      const categoryName = entry.category?.name || "Kategoriyasiz"
      const categoryIcon = entry.category?.icon || "📝"
      const categoryColor = entry.category?.color || "#6B7280"

      if (categoryName === "Ish" || categoryName === "O'qish") {
        workStudyTime += duration
      }

      if (categoryStats.has(categoryName)) {
        const existing = categoryStats.get(categoryName)
        existing.total_duration += duration
        existing.entry_count += 1
      } else {
        categoryStats.set(categoryName, {
          category_name: categoryName,
          category_icon: categoryIcon,
          category_color: categoryColor,
          total_duration: duration,
          entry_count: 1,
        })
      }
    })

    const categories = Array.from(categoryStats.values()).sort((a, b) => b.total_duration - a.total_duration)

    const mostUsed = categories.length > 0 ? categories[0] : null
    const leastUsed = categories.length > 1 ? categories[categories.length - 1] : null

    return NextResponse.json({
      total_time: totalTime,
      categories,
      most_used_category: mostUsed,
      least_used_category: leastUsed,
      work_study_time: workStudyTime,
    })
  } catch (error) {
    console.error("Weekly statistics error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
