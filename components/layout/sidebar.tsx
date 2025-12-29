"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  items: Array<{
    title: string
    href: string
    icon: React.ReactNode
  }>
}

export function Sidebar({ items }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-blue-600 text-white rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <div
        className={cn(
                    "fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white transform transition-transform duration-200 md:translate-x-0 md:static",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-blue-600">
            <h2 className="text-xl font-bold">Extensión Universitaria Táchira</h2>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-600 text-blue-100"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-blue-600 space-y-3">
            <div className="flex items-center gap-3">
              <img src={user?.avatar || "/placeholder.svg"} alt={user?.name} className="w-10 h-10 rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white border-blue-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
