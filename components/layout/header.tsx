"use client"

import { useAuthStore } from "@/lib/auth-store"

export function Header() {
  const user = useAuthStore((state) => state.user)

  return (
    <header className="bg-white border-b border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-3">
          <img src={user?.avatar || "/placeholder.svg"} alt={user?.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
