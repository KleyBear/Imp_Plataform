"use client"

import { useState } from "react"
import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { BookOpen, Home } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, login } = useAuthStore()

  useEffect(() => {
    if (user) {
      const roleRoutes: Record<string, string> = {
        admin: "/dashboard/admin",
        teacher: "/dashboard/teacher",
        participant: "/dashboard/participant",
      }
      router.push(roleRoutes[user.role] || "/")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const users = await api.getUsers()
      const foundUser = users.find((u: any) => u.email === email && u.password === password)

      if (!foundUser) {
        setError("Email o contraseña incorrectos")
        return
      }

      login({
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        email: foundUser.email,
        phone: foundUser.phone,
        role: foundUser.role,
        avatar: foundUser.avatar,
      })
    } catch (err) {
      setError("Error al conectar con el servidor")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Home className="w-4 h-4" />
              Volver a Inicio
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Extensión Universitaria Táchira</h1>
          </div>
          <p className="text-gray-600">Plataforma de Cursos en Línea</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Inicia Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput id="password" value={password} onChange={setPassword} placeholder="••••••••" />
              </div>

              {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Conectando..." : "Inicia Sesión"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  Regístrate aquí
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t space-y-2">
              <p className="text-xs text-gray-500 font-semibold">Credenciales de demostración:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  <strong>Admin:</strong> admin@platform.com / admin123
                </p>
                <p>
                  <strong>Docente:</strong> juan@platform.com / teacher123
                </p>
                <p>
                  <strong>Estudiante:</strong> maria@platform.com / student123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
