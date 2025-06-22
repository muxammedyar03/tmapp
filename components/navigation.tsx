"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Timer, BarChart3, User, Settings, LogOut, Icon, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navigation = [
    { name: "Таймер", href: "/", icon: Timer },
    { name: "Статистика", href: "/statistics", icon: BarChart3 },
    { name: "Профиль", href: "/profile", icon: User },
    { name: "Настройки", href: "/settings", icon: Settings },
  ]

  if (!user) return null

  return (
    <nav className="border-b sticky top-0 z-10 bg-background">
      <div className="container mx-auto p-0">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">
              TimeTracker
            </Link>
          </div>

          <div className="hidden md:flex items-center md:space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="flex md:hidden items-center justify-around sm:justify-center sm:gap-x-10 w-full fixed left-0 py-2 z-10 bottom-0 border-t bg-card md:space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-xs font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {item.name}
                </Link>
              )
            })}
          </div>
            
          <Button variant="ghost" className="text-red-600 border" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
      <div></div>
    </nav>
  )
}
