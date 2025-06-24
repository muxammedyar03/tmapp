"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { Loader2, Moon, Sun, Monitor, MessageCircle } from "lucide-react"
import Link from "next/link"

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
    { value: "light", label: "Светлая", icon: Sun },
    { value: "dark", label: "Тёмная", icon: Moon },
    { value: "system", label: "Системная", icon: Monitor },
  ]

  return (
    <div className="min-h-screen bg-background mb-16 md:m-0">
      <title>Настройки</title>
      <meta name="description" content="Time Management Application" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="https://7pace.gallerycdn.vsassets.io/extensions/7pace/timetracker/5.71.0.2/1747838120337/Microsoft.VisualStudio.Services.Icons.Default" />
      
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Настройки</h1>
            <p className="text-muted-foreground">Управляйте настройками приложения</p>
          </div>

          <Card>
            <CardHeader className="px-3 sm:px-6">
              <CardTitle>Внешний вид</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-3 sm:p-6">
              <Label htmlFor="theme">Тема</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                const Icon = option.icon
                return (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "ghost" : "outline"}
                    onClick={() => setTheme(option.value)}
                    className={"flex items-center gap-2 border"}
                    >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Уведомление по завершении таймера</Label>
                  <p className="text-sm text-muted-foreground">Получать уведомление, когда таймер завершён</p>
                </div>
                <Button variant="outline" disabled>
                  Скоро будет
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ежедневный отчёт</Label>
                  <p className="text-sm text-muted-foreground">Получать ежедневный отчёт о деятельности</p>
                </div>
                <Button variant="outline" disabled>
                  Скоро будет
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="py-2 text-primary">Отправляйте дополнительные советы или сообщения об ошибках</p>
                <Link
                  href={'/Faq'}
                  className="flex items-center justify-center h-10 w-32 border px-2 rounded-md text-base text-primary text gap-1 font-medium transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  FAQ
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Экспорт данных</Label>
                  <p className="text-sm text-muted-foreground">Скачать все записи времени в формате CSV</p>
                </div>
                <Button variant="outline" disabled>
                  Скоро будет
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Удалить данные</Label>
                  <p className="text-sm text-muted-foreground">Полностью удалить все данные</p>
                </div>
                <Button variant="destructive" disabled>
                  Скоро будет
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
