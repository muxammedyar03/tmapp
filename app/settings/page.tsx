"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Loader2, Moon, Sun, Monitor } from "lucide-react"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const themeOptions = [
    { value: "light", label: "Yorug'", icon: Sun },
    { value: "dark", label: "Qorong'u", icon: Moon },
    { value: "system", label: "Tizim", icon: Monitor },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Sozlamalar</h1>
            <p className="text-muted-foreground">Ilova sozlamalarini boshqaring</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ko'rinish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Mavzu</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mavzu tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {themeOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bildirishnomalar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Timer tugaganda bildirishnoma</Label>
                  <p className="text-sm text-muted-foreground">Timer tugaganida bildirishnoma olish</p>
                </div>
                <Button variant="outline" disabled>
                  Tez orada
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Kunlik hisobot</Label>
                  <p className="text-sm text-muted-foreground">Har kuni faoliyat hisobotini olish</p>
                </div>
                <Button variant="outline" disabled>
                  Tez orada
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ma'lumotlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Ma'lumotlarni eksport qilish</Label>
                  <p className="text-sm text-muted-foreground">Barcha vaqt yozuvlarini CSV formatida yuklab olish</p>
                </div>
                <Button variant="outline" disabled>
                  Tez orada
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ma'lumotlarni o'chirish</Label>
                  <p className="text-sm text-muted-foreground">Barcha ma'lumotlarni butunlay o'chirish</p>
                </div>
                <Button variant="destructive" disabled>
                  Tez orada
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
