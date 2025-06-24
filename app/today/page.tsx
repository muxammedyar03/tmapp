"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { TimeEntry } from "@/lib/types"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface CategoryStats {
  category_name: string
  category_icon: string
  category_color: string
  total_duration: number
  entry_count: number
}

export default function Today() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [dailyStats, setDailyStats] = useState<CategoryStats[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [totalTime, setTotalTime] = useState(0)
  const [workStudyTime, setWorkStudyTime] = useState(0)
  const [unproductiveTime, setUnproductiveTime] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    } else if (user) {
      fetchDailyStats()
    }
  }, [user, loading, router])

  const fetchDailyStats = async () => {
    setStatsLoading(true)
  
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
  
    try {
      let data: TimeEntry[] = []
      const response = await fetch("/api/time-entries")
      if (response.ok) {
        data = await response.json()
      }
  
      const filtered = data.filter(entry => {
        const created = new Date(entry.createdAt)
        return created >= today && created < tomorrow
      })
  
      const categoryMap = new Map<string, CategoryStats>()
      let total = 0
      let workStudy = 0
      let unproductive = 0
  
      filtered.forEach(entry => {
        const duration = entry.duration || 0
        const name = entry.category?.name || "Без категории"
        const icon = entry.category?.icon || "📝"
        const color = entry.category?.color || "#6B7280"
  
        total += duration
  
        if (name === "Работа" || name === "Учеба") {
          workStudy += duration
        } else if (["Отдых", "Обед", "Другое"].includes(name)) {
          unproductive += duration
        }
  
        if (categoryMap.has(name)) {
          const existing = categoryMap.get(name)!
          existing.total_duration += duration
          existing.entry_count += 1
        } else {
          categoryMap.set(name, {
            category_name: name,
            category_icon: icon,
            category_color: color,
            total_duration: duration,
            entry_count: 1
          })
        }
      })
  
      const stats = Array.from(categoryMap.values()).filter(c => c.total_duration > 0)
  
      setDailyStats(stats)
      setTotalTime(total)
      setWorkStudyTime(workStudy)
      setUnproductiveTime(unproductive)
    } catch (e) {
      console.error("Ошибка при загрузке статистики:", e)
    } finally {
      setStatsLoading(false)
    }
  }

  const formatHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    let unit: string
  
    const lastDigit = hours % 10
    const lastTwoDigits = hours % 100
  
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      unit = "часов"
    } else if (lastDigit === 1) {
      unit = "час"
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      unit = "часа"
    } else {
      unit = "часов"
    }
  
    return `${hours} ${unit}`
  }
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}ч ${minutes}м`
  }

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <title>Сегодняшняя Статистика</title>
      <meta name="description" content="Time Management Application" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="https://7pace.gallerycdn.vsassets.io/extensions/7pace/timetracker/5.71.0.2/1747838120337/Microsoft.VisualStudio.Services.Icons.Default" />
      
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-xl md:text-3xl font-bold">Статистика за сегодня</h1>
            <p className="text-sm md:text-base text-muted-foreground">Ваши активности за текущий день</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Общее время */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-lg">🕒</span>
                <span className="text-2xl text-foreground">{formatTime(totalTime)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">Общее время</div>
              <div className="text-xs text-muted-foreground">{formatHours(totalTime)}</div>
            </CardContent>
          </Card>

          {/* Эффективное время (работа и учёба) */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-lg">📚</span>
                <span className="text-2xl text-foreground">{formatTime(workStudyTime)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">Эффективное время</div>
              <div className="text-xs text-muted-foreground">
                {((workStudyTime / totalTime) * 100).toFixed(1)}% от общего
              </div>
            </CardContent>
          </Card>

          {/* Бесполезное время (отдых и другое) */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <span className="text-lg">😴</span>
                <span className="text-2xl text-foreground">{formatTime(unproductiveTime)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">Бесполезное время</div>
              <div className="text-xs text-muted-foreground">
                {((unproductiveTime / totalTime) * 100).toFixed(1)}% от общего
              </div>
            </CardContent>
          </Card>
        </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Категории активности</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Нет данных за сегодня</p>
              ) : (
                <div className="w-full h-[300px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={dailyStats}
                        dataKey="total_duration"
                        nameKey="category_name"
                        outerRadius={100}
                        fill="#8884d8"
                        label={({ name }) => name}
                      >
                        {dailyStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.category_color}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatTime(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
