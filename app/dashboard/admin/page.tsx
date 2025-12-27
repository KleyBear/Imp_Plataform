"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, BookOpen, BarChart3, Settings } from "lucide-react"

const RechartsTooltip = Tooltip as any

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, teachers: 0, courses: 0, participants: 0, enrollments: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [roleDistribution, setRoleDistribution] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 2000)
    return () => clearInterval(interval)
  }, [])

  async function loadStats() {
    try {
      const [users, courses, enrollments] = await Promise.all([api.getUsers(), api.getCourses(), api.getEnrollments()])

      const teachers = users.filter((u: any) => u.role === "teacher").length
      const participants = users.filter((u: any) => u.role === "participant").length
      const admins = users.filter((u: any) => u.role === "admin").length

      setStats({
        users: users.length,
        teachers,
        courses: courses.length,
        participants,
        enrollments: enrollments.length,
      })

      const coursesByTeacher = courses.reduce((acc: any, course: any) => {
        const existing = acc.find((c: any) => c.name === course.category)
        if (existing) {
          existing.cursos += 1
          existing.inscritos += course.students
        } else {
          acc.push({ name: course.category, cursos: 1, inscritos: course.students })
        }
        return acc
      }, [] as any[])

      setChartData(coursesByTeacher)

      setRoleDistribution([
        { name: "Administradores", value: admins, color: "#ef4444" },
        { name: "Docentes", value: teachers, color: "#3b82f6" },
        { name: "Participantes", value: participants, color: "#10b981" },
      ])

      setIsLoading(false)
    } catch (error) {
      console.error("Error loading stats:", error)
      setIsLoading(false)
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Dashboard Administrativo</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats.users}</div>
                <p className="text-xs text-slate-500 mt-1">Usuarios activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {stats.users - stats.teachers - stats.participants}
                </div>
                <p className="text-xs text-slate-500 mt-1">Gestores de plataforma</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Docentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.teachers}</div>
                <p className="text-xs text-slate-500 mt-1">Creadores de cursos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.participants}</div>
                <p className="text-xs text-slate-500 mt-1">Estudiantes activos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Cursos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.courses}</div>
                <p className="text-xs text-slate-500 mt-1">Cursos disponibles</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Estadísticas por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center text-slate-500">Cargando...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="cursos" fill="#3b82f6" name="Cursos" />
                      <Bar dataKey="inscritos" fill="#10b981" name="Inscritos" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Roles</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center text-slate-500">Cargando...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={roleDistribution} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                        {roleDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen General de la Plataforma</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-blue-600 pl-4">
                  <p className="text-sm text-slate-600 mb-1">Total de Inscripciones</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.enrollments}</p>
                </div>
                <div className="border-l-4 border-green-600 pl-4">
                  <p className="text-sm text-slate-600 mb-1">Promedio de Estudiantes por Curso</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.courses > 0 ? Math.round(stats.enrollments / stats.courses) : 0}
                  </p>
                </div>
                <div className="border-l-4 border-purple-600 pl-4">
                  <p className="text-sm text-slate-600 mb-1">Tasa de Adopción</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stats.participants > 0 ? Math.round((stats.enrollments / stats.participants) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
