"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PasswordInput } from "@/components/ui/password-input"
import { Trash2, Edit2, UserPlus, Users, BookOpen, BarChart3, Settings, Search, Lock } from "lucide-react"

interface User {
  id: number
  name: string
  username: string
  email: string
  role: string
  avatar: string
  createdAt: string
}

export default function UsersPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "participant",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  async function loadUsers() {
    try {
      const data = await api.getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.name.trim().length < 3) newErrors.name = "Nombre debe tener al menos 3 caracteres"
    if (/\d/.test(formData.name)) newErrors.name = "Nombre no puede contener números"
    if (formData.username.trim().length < 3) newErrors.username = "Username debe tener al menos 3 caracteres"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) newErrors.email = "Email inválido"
    if (!editingUser && formData.password.length < 8) newErrors.password = "Contraseña debe tener al menos 8 caracteres"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveUser = async () => {
    if (!validateForm()) return

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          role: formData.role,
        })
      } else {
        await api.createUser({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
          createdAt: new Date().toISOString().split("T")[0],
        })
      }
      setIsDialogOpen(false)
      setFormData({ name: "", username: "", email: "", password: "", role: "participant" })
      setEditingUser(null)
      setErrors({})
      loadUsers()
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  const handleChangeUserPassword = async () => {
    setPasswordError("")

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    try {
      await api.updateUser(selectedUserForPassword!.id, {
        password: newPassword,
      })
      setIsPasswordDialogOpen(false)
      setSelectedUserForPassword(null)
      setNewPassword("")
      setConfirmPassword("")
      alert("Contraseña actualizada exitosamente")
      loadUsers()
    } catch (error) {
      console.error("Error updating password:", error)
      setPasswordError("Error al cambiar la contraseña")
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await api.deleteUser(id)
        loadUsers()
      } catch (error) {
        console.error("Error deleting user:", error)
      }
    }
  }

  const handleEditUser = (u: User) => {
    setEditingUser(u)
    setFormData({ name: u.name, username: u.username, email: u.email, password: "", role: u.role })
    setIsDialogOpen(true)
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingUser(null)
                    setFormData({ name: "", username: "", email: "", password: "", role: "participant" })
                    setErrors({})
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Agregar Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? "Actualiza la información del usuario" : "Completa todos los datos del usuario"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="username">Nombre de Usuario</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>
                  {!editingUser && (
                    <div>
                      <Label htmlFor="password">Contraseña</Label>
                      <PasswordInput
                        id="password"
                        value={formData.password}
                        onChange={(value) => setFormData({ ...formData, password: value })}
                        placeholder="Mínimo 8 caracteres"
                        className={errors.password ? "border-red-500" : ""}
                      />
                      {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="teacher">Docente</SelectItem>
                        <SelectItem value="participant">Participante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveUser} className="w-full">
                    {editingUser ? "Actualizar" : "Crear"} Usuario
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">Cargando usuarios...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Rol</th>
                        <th className="text-right py-3 px-4 font-medium text-slate-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img src={u.avatar || "/placeholder.svg"} alt={u.name} className="w-8 h-8 rounded-full" />
                              <div>
                                <p className="font-medium text-slate-900">{u.name}</p>
                                <p className="text-xs text-slate-500">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{u.email}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                u.role === "admin"
                                  ? "bg-red-100 text-red-700"
                                  : u.role === "teacher"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {u.role === "admin" ? "Admin" : u.role === "teacher" ? "Docente" : "Participante"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Dialog
                              open={isPasswordDialogOpen && selectedUserForPassword?.id === u.id}
                              onOpenChange={setIsPasswordDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUserForPassword(u)
                                    setNewPassword("")
                                    setConfirmPassword("")
                                    setPasswordError("")
                                  }}
                                >
                                  <Lock className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Cambiar Contraseña</DialogTitle>
                                  <DialogDescription>Cambia la contraseña para {u.name}</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="newPass">Nueva Contraseña</Label>
                                    <PasswordInput
                                      id="newPass"
                                      value={newPassword}
                                      onChange={setNewPassword}
                                      placeholder="Mínimo 8 caracteres"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="confirmPass">Confirmar Contraseña</Label>
                                    <PasswordInput
                                      id="confirmPass"
                                      value={confirmPassword}
                                      onChange={setConfirmPassword}
                                      placeholder="Confirma la contraseña"
                                    />
                                  </div>
                                  {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
                                  <Button onClick={handleChangeUserPassword} className="w-full">
                                    Cambiar Contraseña
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
