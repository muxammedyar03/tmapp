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

    // Get start of current week (Monday)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    try {
      let data:TimeEntry[] = []
      const response = await fetch("/api/time-entries")
      if (response.ok) {
        data = await response.json()
      }

      // Process data
      const categoryMap = new Map<string, CategoryStats>()
      let totalTime = 0
      let workStudyTime = 0

      data?.forEach((entry: any) => {
        const duration = entry.duration || 0
        totalTime += duration

        const categoryName = entry.category?.name || "Kategoriyasiz"
        const categoryIcon = entry.category?.icon || "📝"
        const categoryColor = entry.category?.color || "#6B7280"

        if (categoryName === "Ish" || categoryName === "O'qish") {
          workStudyTime += duration
        }

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
      })

      const categories = Array.from(categoryMap.values()).sort((a, b) => b.total_duration - a.total_duration)

      const mostUsed = categories.length > 0 ? categories[0] : null
      const leastUsed = categories.length > 1 ? categories[categories.length - 1] : null

      setWeeklyStats({
        total_time: totalTime,
        categories,
        most_used_category: mostUsed,
        least_used_category: leastUsed,
        work_study_time: workStudyTime,
      })
    } catch (error) {
      console.error("Error processing stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}ч ${minutes}д`
  }

  const formatHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    let unit: string;
  
    const lastDigit = hours % 10;
    const lastTwoDigits = hours % 100;
  
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      unit = "часов";
    } else if (lastDigit === 1) {
      unit = "час";
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      unit = "часа";
    } else {
      unit = "часов";
    }
  
    return `${hours} ${unit}`;
  };

  if (loading || statsLoading) {
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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Еженедельная статистика</h1>
            <p className="text-muted-foreground">Ваша активность на этой неделе</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Oбщее время</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weeklyStats ? formatTime(weeklyStats.total_time) : "0с 0д"}</div>
                <p className="text-xs text-muted-foreground">
                  {weeklyStats ? formatHours(weeklyStats.total_time) : "0 часов"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Самый</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl">
                  {weeklyStats?.most_used_category
                    ? formatTime(weeklyStats.most_used_category.total_duration)
                    : "0с 0д"}
                </p>
                <div className="flex items-end gap-x-2">
                  <div className="text-xs font-bold">{weeklyStats?.most_used_category?.category_icon || "📝"}</div>
                  <p className="text-xs text-muted-foreground">
                    {weeklyStats?.most_used_category?.category_name || "Нет данных"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Работа и учёба</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {weeklyStats ? formatTime(weeklyStats.work_study_time) : "0с 0д"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {weeklyStats
                    ? `${((weeklyStats.work_study_time / weeklyStats.total_time) * 100 || 0).toFixed(1)}% от общего времени`
                    : "0% от общего времени"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Распределение по категориям</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyStats?.categories.map((category) => {
                  const percentage =
                    weeklyStats.total_time > 0 ? (category.total_duration / weeklyStats.total_time) * 100 : 0

                  return (
                    <div key={category.category_name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.category_icon}</span>
                          <span className="font-medium">{category.category_name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatTime(category.total_duration)}</div>
                          <div className="text-sm text-muted-foreground">{category.entry_count} занятия</div>
                        </div>
                      </div>
                      <Progress
                        value={percentage}
                        className="h-2"
                        style={
                          {
                            "--progress-background": category.category_color,
                          } as React.CSSProperties
                        }
                      />
                      <div className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}%</div>
                    </div>
                  )
                })}

                {(!weeklyStats?.categories || weeklyStats.categories.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">Пока нет никакой активности.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
