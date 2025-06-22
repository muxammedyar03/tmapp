"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

interface Profile {
  id: string
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  createdAt: string | null
  updatedAt: string | null
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState(" ")
  const [email, setEmail] = useState(" ")
  const [saving, setSaving] = useState(false)
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
      setProfile(data)
      setFullName(data.fullName)
      setEmail(data.email)
    } else {
      console.error("Ошибка токена или пользователь не найден")
    }
  
    setProfileLoading(false)
  }
  

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]
      
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName || profile?.fullName || "",
          email: email || profile?.email || "",
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        toast({
          title: "ошибка",
          description: errorData.error || "Произошла ошибка при обновлении вашего профиля.",
          variant: "destructive",
        })
        return
      }
      const updatedProfile = await response.json()
      setSaving(false)
      setProfile(updatedProfile)
      setFullName(updatedProfile.fullName || "")
      setEmail(updatedProfile.email || "")
      toast({
        title: "Успешный",
        description: "Ваш профиль успешно обновлен.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении вашего профиля.",
        variant: "destructive",
      })
    }
  }

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Профиль</h1>
            <p className="text-muted-foreground">Управляйте своей личной информацией</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-xl">Персональная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Полное имя</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Введите свое полное имя."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Электронная почта</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите свой адрес электронной почты"
                  />
                </div>

                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Сохранять
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
