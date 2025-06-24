"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { TimerComponent } from "@/components/timer-component"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

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

  return (
    <>
      <title>Time Managemant App</title>
      <meta name="description" content="Time Management Application" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="https://7pace.gallerycdn.vsassets.io/extensions/7pace/timetracker/5.71.0.2/1747838120337/Microsoft.VisualStudio.Services.Icons.Default" />
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <TimerComponent />
        </main>
      </div>
    </>
  )
}
