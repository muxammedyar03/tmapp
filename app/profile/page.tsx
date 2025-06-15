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
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save } from "lucide-react"

interface Profile {
  id: string
  email: string | null
  fullName: string | null
  avatarUrl: string | null
  created_at: string | null
  updated_at: string | null
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
          title: "Xatolik",
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
              <CardTitle>Персональная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">To'liq ism</Label>
                  <Input
                    id="fullName"
                    value={fullName == " " ? profile?.fullName ?? "" : fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="To'liq ismingizni kiriting"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email === " " ? profile?.email ?? "" : email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email manzilingizni kiriting"
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

          <Card>
            <CardHeader>
              <CardTitle>Информация об аккаунте</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>ID пользователя</Label>
                  <div className="text-sm text-muted-foreground font-mono">{profile?.id}</div>
                </div>

                <div>
                  <Label>Дата регистрации</Label>
                  <div className="text-sm text-muted-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("uz-UZ") : "Нет информации"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
