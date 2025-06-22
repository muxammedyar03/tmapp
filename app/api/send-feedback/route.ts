import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const name = formData.get("name")?.toString() || "Ismi yo‘q"
    const email = formData.get("email")?.toString() || "Email yo‘q"
    const feedback = formData.get("feedback")?.toString() || "Bo‘sh"
    const date = formData.get("date")?.toString() || new Date().toISOString()
    const image = formData.get("image") as File | null

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "djumabaev003@gmail.com",
        pass: process.env.EMAIL_PASS || "",
      },
    })

    const attachments = []
    if (image && image.size > 0) {
      const buffer = Buffer.from(await image.arrayBuffer())
      attachments.push({
        filename: image.name,
        content: buffer,
        contentType: image.type,
      })
    }

    await transporter.sendMail({
      from: email,
      to: "djumabaev003@gmail.com",
      subject: `🛠 Feedback: ${name} (${email})`,
      text: `Foydalanuvchi: ${name} (${email})\n\nFeedback:\n${feedback}\n\nYuborilgan sana: ${date}`,
      attachments,
    })

    return NextResponse.json({ message: "Feedback yuborildi" }, { status: 200 })
  } catch (error) {
    console.error("Email yuborishda xatolik:", error)
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 })
  }
}
