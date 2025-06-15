import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Token topilmadi" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Me endpoint error:", error)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Token topilmadi" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    console.log(token);
    

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 })
    }

    const body = await request.json()

    const { fullName, email } = body

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName,
        email,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("PATCH me endpoint error:", error)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}
