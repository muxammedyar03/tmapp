"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Square } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Category, TimeEntry } from "@/lib/types"

export function TimerComponent() {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchCategories()
      fetchTimeEntries()
    }
  }, [user])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch("/api/time-entries")
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data)
      }
    } catch (error) {
      console.error("Error fetching time entries:", error)
    }
  }
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  useEffect(() => {
    const unfinishedEntries = timeEntries.filter((entry) => !entry.endTime);
    if (unfinishedEntries.length > 0 && !isRunning) {
      const entry = unfinishedEntries[0];
      const startTime = new Date(entry.startTime).getTime();
      const now = Date.now();
      const duration = Math.floor((now - startTime) / 1000); 
      setTime(duration);
      setCurrentEntryId(entry.id);
      setTitle(entry.title);
      setSelectedCategory(entry.categoryId || "");
      setIsRunning(true);
    }
  }, [timeEntries]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStart = async () => {
    if (!title.trim()) {
      toast({
        title: "Ошибка",
        description: "Необходимо ввести имя таймера.",
        variant: "destructive",
      })
      return
    }

    startTimeRef.current = new Date()
    setIsRunning(true)

    try {
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          categoryId: selectedCategory || null,
          startTime: startTimeRef.current.toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentEntryId(data.id)
      } else {
        throw new Error("Не удалось создать запись времени")
      }
    } catch (error) {
      console.error("Error creating time entry:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при создании таймера.",
        variant: "destructive",
      })
      setIsRunning(false)
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = async () => {
    if (!currentEntryId) return

    const endTime = new Date()
    const duration = time

    setIsRunning(false)
    setTime(0)

    try {
      const response = await fetch(`/api/time-entries/${currentEntryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: endTime.toISOString(),
          duration: duration,
        }),
      })

      if (response.ok) {
        toast({
          title: "Успех",
          description: `Таймер остановлен: ${formatTime(duration)}`,
        })
        setTitle("")
        setSelectedCategory("")
        setCurrentEntryId(null)
        fetchTimeEntries()
      } else {
        throw new Error("Failed to update time entry")
      }
    } catch (error) {
      console.error("Error updating time entry:", error)
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при остановке таймера.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-none border-0">
        <CardContent className="pt-6 bg-border dark:bg-gray-900 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 tems-center justify-center w-full text-2xl">
            <div className="flex items-center justify-center">
              <a href="https://music.yandex.uz/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Yandex_Music_icon_2023.svg/2048px-Yandex_Music_icon_2023.svg.png" className="w-8 h-8" alt="yandex music" loading="lazy"/>
                Music
              </a>
            </div>
            <div className="flex items-center justify-center">
              <a href="https://www.notion.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <img src="https://img.icons8.com/ios7/600/notion.png" className="w-8 object-cover bg-white rounded" alt="notion" loading="lazy"/>
                Notion
              </a>
            </div>
            <div className="flex items-center justify-center">
              <a href="https://trello.com/b/HYJL8Hiz/link" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <img src="https://www.svgrepo.com/show/354463/trello.svg" className="w-8 object-cover" alt="trello" loading="lazy"/>
                Tasks
              </a>
            </div>
            <div className="flex items-center justify-center">
              <a href="https://discord.com/channels/@me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <img src="https://www.svgrepo.com/show/353655/discord-icon.svg" className="w-8 object-cover" alt="discord" loading="lazy"/>
                Discord
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="gap-x-4 grid grid-cols-1 lg:grid-cols-2">
        {/* Main Timer */}
        <Card className="border-0 rounded-none">
          <CardHeader>
            <CardTitle>Таймер</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center w-full bg-border dark:bg-gray-900 p-3 px-5 rounded-lg">
            <div className="text-4xl text-center">{formatTime(time)}</div>
            <div className="flex justify-center">
              {!isRunning ? (
                <button onClick={handleStart} className="w-12 h-12 bg-green-600/20 hover:bg-green-600/30 flex items-center justify-center rounded-full">
                  <Play className="w-10 fill-green-500 stroke-green-500"/>
                </button>
              ) : (
                <button className="flex items-center gap-2">
                  <button onClick={handlePause} className="w-12 h-12 bg-green-600/20 hover:bg-green-600/30 flex items-center justify-center rounded-full">
                    <Pause className="w-10 fill-green-500 stroke-green-500" />
                  </button>
                  <Button onClick={handleStop} className="w-12 h-12 bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center rounded-full">
                    <Square className="w-10 fill-amber-500 stroke-amber-500" />
                  </Button>
                </button>
              )}
            </div>
          </CardContent>
          <CardContent className="pt-4 px-0">
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="timer-title">Название таймера</Label>
                <Input
                  id="timer-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Над чем вы работаете?"
                  disabled={isRunning}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isRunning}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 rounded-none border-l">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Последние таймеры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span>{entry.category?.icon || "⏰"}</span>
                      <div>
                        <div className="font-medium">{entry.title}</div>
                        <div className="text-sm text-muted-foreground">{entry.category?.name || "Kategoriyasiz"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">{entry.duration ? formatTime(entry.duration) : "Davom etmoqda..."}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.startTime).toLocaleDateString("uz-UZ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
