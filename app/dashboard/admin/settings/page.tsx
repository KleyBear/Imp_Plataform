"use client"

import type React from "react"
import { PasswordInput } from "@/components/ui/password-input"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, BookOpen, BarChart3, Settings, Upload } from "lucide-react"

export default function AdminSettingsPage() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const router = useRouter()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      await api.updateUser(user!.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
      })
      setUser({ ...user!, ...formData })
      setIsEditingProfile(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsLoading(true)
    try {
      await api.updateUser(user!.id, {
        password: passwordData.newPassword,
      })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setIsEditingPassword(false)
      alert("Contraseña actualizada exitosamente")
    } catch (error) {
      console.error("Error updating password:", error)
      setPasswordError("Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newAvatar = event.target?.result as string
        if (user) {
          setUser({ ...user, avatar: newAvatar })
          api.updateUser(user.id, { avatar: newAvatar })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const menuItems = [
    { title: "Dashboard", href: "/dashboard/admin", icon: <BarChart3 className="w-5 h-5" /> },
    { title: "Usuarios", href: "/dashboard/admin/users", icon: <Users className="w-5 h-5" /> },
    { title: "Cursos", href: "/dashboard/admin/courses", icon: <BookOpen className="w-5 h-5" /> },
    { title: "Configuración", href: "/dashboard/admin/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={menuItems} />
      <div className="flex-1 md:ml-0 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 mt-12 md:mt-0">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Configuración de Perfil</h2>

          <div className="space-y-6 max-w-2xl">
            {/* Foto de Perfil */}
            <Card>
              <CardHeader>
                <CardTitle>Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <img
                  src={user?.avatar || "/placeholder.svg"}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button asChild variant="outline">
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Cambiar Foto
                      </span>
                    </Button>
                  </Label>
                  <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
              </CardContent>
            </Card>

            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Nombre de Usuario</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Nombre</p>
                      <p className="font-medium text-slate-900">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Usuario</p>
                      <p className="font-medium text-slate-900">{formData.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{formData.email}</p>
                    </div>
                    <Button onClick={() => setIsEditingProfile(true)}>Editar Perfil</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cambio de Contraseña */}
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <PasswordInput
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(value) => setPasswordData({ ...passwordData, newPassword: value })}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <PasswordInput
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(value) => setPasswordData({ ...passwordData, confirmPassword: value })}
                        placeholder="Confirma tu nueva contraseña"
                      />
                    </div>
                    {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
                    <div className="flex gap-2">
                      <Button onClick={handleChangePassword} disabled={isLoading}>
                        {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingPassword(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditingPassword(true)}>Cambiar Contraseña</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
