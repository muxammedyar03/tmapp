import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { endTime, duration } = await request.json()

    const timeEntry = await prisma.timeEntry.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: {
        endTime: endTime ? new Date(endTime) : null,
        duration,
      },
      include: { category: true },
    })

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error("Time entry update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
