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

    const timeEntries = await prisma.timeEntry.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json(timeEntries)
  } catch (error) {
    console.error("Time entries fetch error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, categoryId, startTime } = await request.json()

    const timeEntry = await prisma.timeEntry.create({
      data: {
        userId: user.id,
        title,
        categoryId: categoryId || null,
        startTime: new Date(startTime),
      },
      include: { category: true },
    })

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error("Time entry creation error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
