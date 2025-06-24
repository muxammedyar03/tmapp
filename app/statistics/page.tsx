"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"
import { Loader2, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { TimeEntry } from "@/lib/types"
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface CategoryStats {
  category_name: string
  category_icon: string
  category_color: string
  total_duration: number
  entry_count: number
}

interface WeeklyStats {
  total_time: number
  categories: CategoryStats[]
  most_used_category: CategoryStats | null
  least_used_category: CategoryStats | null
  work_study_time: number
  unproductive_time: number
  daily_effectiveness: { day: string, duration: number }[]
}

export default function StatisticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    } else if (user) {
      fetchWeeklyStats()
    }
  }, [user, loading, router])

  const fetchWeeklyStats = async () => {
    setStatsLoading(true)

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    try {
      let data: TimeEntry[] = []
      const response = await fetch("/api/time-entries")
      if (response.ok) {
        data = await response.json()
      }

      const categoryMap = new Map<string, CategoryStats>()
      let totalTime = 0
      let workStudyTime = 0
      let unproductiveTime = 0
      const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
      const effectivenessMap = new Map<number, number>()

      data?.forEach((entry: any) => {
        const created = new Date(entry.createdAt)
        if (created >= startOfWeek && created <= now) {
          const duration = entry.duration || 0
          totalTime += duration

          const categoryName = entry.category?.name || "Без категории"
          const categoryIcon = entry.category?.icon || "📝"
          const categoryColor = entry.category?.color || "#6B7280"

          if (["Работа", "Учеба"].includes(categoryName)) {
            workStudyTime += duration
          } else if (["Отдых", "Другое"].includes(categoryName)) {
            unproductiveTime += duration
          }

          const dayIndex = created.getDay() === 0 ? 6 : created.getDay() - 1
          effectivenessMap.set(dayIndex, (effectivenessMap.get(dayIndex) || 0) + (categoryName === "Работа" || categoryName === "Учеба" ? duration : 0))

          if (categoryMap.has(categoryName)) {
            const existing = categoryMap.get(categoryName)!
            existing.total_duration += duration
            existing.entry_count += 1
          } else {
            categoryMap.set(categoryName, {
              category_name: categoryName,
              category_icon: categoryIcon,
              category_color: categoryColor,
              total_duration: duration,
              entry_count: 1,
            })
          }
        }
      })

      const categories = Array.from(categoryMap.values()).sort((a, b) => b.total_duration - a.total_duration)
      const mostUsed = categories.length > 0 ? categories[0] : null
      const leastUsed = categories.length > 1 ? categories[categories.length - 1] : null
      const daily_effectiveness = Array.from({ length: 7 }, (_, i) => ({
        day: days[i],
        duration: Math.floor((effectivenessMap.get(i) || 0) / 3600),
      }))

      setWeeklyStats({
        total_time: totalTime,
        categories,
        most_used_category: mostUsed,
        least_used_category: leastUsed,
        work_study_time: workStudyTime,
        unproductive_time: unproductiveTime,
        daily_effectiveness,
      })
    } catch (error) {
      console.error("Ошибка при получении статистики:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}ч ${minutes}м`
  }

  if (loading || statsLoading || !weeklyStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen mb-16 md:mb-0 bg-background">
      <title>Еженедельная Статистика</title>
      <meta name="description" content="Time Management Application" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="https://7pace.gallerycdn.vsassets.io/extensions/7pace/timetracker/5.71.0.2/1747838120337/Microsoft.VisualStudio.Services.Icons.Default" />
      
      <Navigation />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <h1 className="text-xl md:text-3xl font-bold">Еженедельная эффективность</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader><CardTitle>Общее время</CardTitle></CardHeader><CardContent className="text-2xl">{formatTime(weeklyStats.total_time)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Эффективность (работа и учёба)</CardTitle></CardHeader><CardContent className="text-2xl">{formatTime(weeklyStats.work_study_time)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Непродуктивное время</CardTitle></CardHeader><CardContent className="text-2xl">{formatTime(weeklyStats.unproductive_time)}</CardContent></Card>
          <Card>
            <CardHeader><CardTitle>Самая используемая категория</CardTitle></CardHeader>
            <CardContent className="text-xl">
              {weeklyStats.most_used_category
                ? `${weeklyStats.most_used_category.category_icon} ${weeklyStats.most_used_category.category_name} — ${formatTime(weeklyStats.most_used_category.total_duration)}`
                : "Нет данных"}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          {/* Pie chart */}
          <Card>
            <CardHeader><CardTitle>Категории (Круговая диаграмма)</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={weeklyStats.categories.filter(c => c.total_duration > 0)}
                    dataKey="total_duration"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {weeklyStats.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category_color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatTime(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* Bar chart */}
          <Card>
            <CardHeader><CardTitle>Эффективность по дням</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats.daily_effectiveness}>
                  <XAxis dataKey="day" />
                  <YAxis label={{ value: "Часы", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}