"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"

export default function FAQPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [feedback, setFeedback] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [fullName, setFullName] = useState(" ")
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    } else if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    setProfileLoading(true)

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1]

    const response = await fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      setFullName(data.fullName)
      setEmail(data.email)
    } else {
      console.error("Ошибка токена или пользователь не найден")
    }

    setProfileLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("email", email)
    formData.append("name", fullName)
    formData.append("feedback", feedback)
    formData.append("date", new Date().toISOString())
    if (file) {
      formData.append("image", file)
    }

    const res = await fetch("/api/send-feedback", {
      method: "POST",
      body: formData,
    })

    setIsLoading(false)
    if (res.ok) {
      setSuccess(true)
      toast({
        title: "Успешно",
        description: `Ваше сообщение было успешно отправлено!`,
      })
      setFeedback("")
      setFile(null)
    } else {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отправке сообщения.",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <Navigation />
      <div className="px-4 md:container max-w-3xl py-10">
        <Card>
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base ">Отправьте отзыв или сообщение об ошибке</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Отзыв или описание ошибки</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Загрузить изображение (необязательно)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Отправка..." : "Отправить"}
              </Button>
              {success && <p className="text-green-600">Сообщение успешно отправлено!</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
