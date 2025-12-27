"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Zap, Award, Settings } from "lucide-react"

interface Activity {
  id: number
  courseId: number
  title: string
  description: string
  dueDate: string
  courseName?: string
  submission?: any
}

export default function ActivitiesPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "participant") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadActivities()
  }, [user])

  async function loadActivities() {
    try {
      const [enrollments, allActivities, submissions, courses] = await Promise.all([
        api.getEnrollments(),
        api.getActivities(),
        api.getSubmissions(),
        api.getCourses(),
      ])

      const userCourseIds = enrollments.filter((e: any) => e.userId === user?.id).map((e: any) => e.courseId)

      const userActivities: Activity[] = allActivities
        .filter((a: any) => userCourseIds.includes(a.courseId))
        .map((a: any) => {
          const course = courses.find((c: any) => c.id === a.courseId)
          const submission = submissions.find((s: any) => s.activityId === a.id && s.userId === user?.id)

          return {
            ...a,
            courseName: course?.title || "Desconocido",
            submission,
          }
        })

      setActivities(userActivities)
    } catch (error) {
      console.error("Error loading activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const menuItems = [
    { title: "Mis Cursos", href: "/dashboard/participant", icon: <BookOpen className="w-5 h-5" /> },
    { title: "Cursos Disponibles", href: "/dashboard/participant/courses", icon: <Zap className="w-5 h-5" /> },
    { title: "Actividades", href: "/dashboard/participant/activities", icon: <Award className="w-5 h-5" /> },
    { title: "Configuración", href: "/dashboard/participant/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={menuItems} />
      <div className="flex-1 md:ml-0 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 mt-12 md:mt-0">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Mis Actividades</h2>

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Cargando actividades...</div>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center text-slate-500">No hay actividades asignadas</CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <Card key={activity.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{activity.title}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{activity.courseName}</p>
                      </div>
                      {activity.submission && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Enviada
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">{activity.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Fecha de Entrega</p>
                        <p className="font-medium text-slate-900">{activity.dueDate}</p>
                      </div>
                      {activity.submission && (
                        <div>
                          <p className="text-xs text-slate-500">Calificación</p>
                          <p className="font-medium text-slate-900">{activity.submission.grade}/100</p>
                        </div>
                      )}
                    </div>
                    {activity.submission?.feedback && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-xs font-medium text-blue-700 mb-1">Feedback del Docente:</p>
                        <p className="text-sm text-blue-600">{activity.submission.feedback}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
