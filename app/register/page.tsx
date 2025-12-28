"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { api } from "@/lib/api"
import { BookOpen, Home } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const validateFullName = (name: string): string | null => {
    if (name.trim().length < 3) return "El nombre debe tener al menos 3 caracteres"
    if (/\d/.test(name)) return "El nombre no puede contener números"
    if (!/^[a-záéíóúñ\s]+$/i.test(name)) return "El nombre solo puede contener letras y espacios"
    return null
  }

  const validateUsername = (username: string): string | null => {
    if (username.trim().length < 3) return "El nombre de usuario debe tener al menos 3 caracteres"
    if (!/^[a-z0-9_-]+$/i.test(username)) return "Solo letras, números, guiones y guiones bajos permitidos"
    return null
  }

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Email inválido"
    return null
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres"
    if (!/[A-Z]/.test(password)) return "Debe contener al menos una mayúscula"
    if (!/[a-z]/.test(password)) return "Debe contener al menos una minúscula"
    if (!/\d/.test(password)) return "Debe contener al menos un número"
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    const fullNameError = validateFullName(formData.fullName)
    if (fullNameError) newErrors.fullName = fullNameError

    const usernameError = validateUsername(formData.username)
    if (usernameError) newErrors.username = usernameError

    const emailError = validateEmail(formData.email)
    if (emailError) newErrors.email = emailError

    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const users = await api.getUsers()
      if (users.some((u: any) => u.email === formData.email)) {
        setErrors({ email: "Este email ya está registrado" })
        setIsLoading(false)
        return
      }

      if (users.some((u: any) => u.username === formData.username)) {
        setErrors({ username: "Este nombre de usuario ya está en uso" })
        setIsLoading(false)
        return
      }

      const newUser = {
        name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "participant",
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
        phone: "",
        createdAt: new Date().toISOString().split("T")[0],
      }

      await api.createUser(newUser)
      setSuccess(true)

      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setErrors({ form: "Error al registrarse. Intenta nuevamente." })
      console.error("Register error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg bg-green-50">
          <CardContent className="pt-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">¡Registro Exitoso!</h2>
            <p className="text-green-600 mb-4">Tu cuenta ha sido creada. Redirigiendo al login...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
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
          <p className="text-gray-600">Regístrate como Participante</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>Solo participantes pueden registrarse</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Juan Pérez García"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "border-red-500" : ""}
                  required
                />
                {errors.fullName && <p className="text-red-600 text-xs">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="juan_perez"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "border-red-500" : ""}
                  required
                />
                {errors.username && <p className="text-red-600 text-xs">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  value={formData.password}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  placeholder="••••••••"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-600 text-xs">{errors.password}</p>}
                <p className="text-xs text-gray-500">Mínimo 8 caracteres, mayúscula, minúscula y número</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                  placeholder="••••••••"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-red-600 text-xs">{errors.confirmPassword}</p>}
              </div>

              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{errors.form}</div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
