"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Zap, Award, Settings, Search, AwardIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface EnrolledCourse {
  id: number
  title: string
  description: string
  category: string
  image: string
  progress: number
  status: string
}

function ParticipantDashboardContent() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [completedCourses, setCompletedCourses] = useState<EnrolledCourse[]>([])
  const [filteredEnrolled, setFilteredEnrolled] = useState<EnrolledCourse[]>([])
  const [filteredCompleted, setFilteredCompleted] = useState<EnrolledCourse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "participant") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadCourses()
    checkWelcomeStatus()
  }, [user])

  const checkWelcomeStatus = () => {
    if (user) {
      const welcomeShown = localStorage.getItem(`welcome_shown_${user.id}`)

      if (!welcomeShown) {
        setShowWelcome(true)
        localStorage.setItem(`welcome_shown_${user.id}`, "true")
      }
    }
  }

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase()
    const enrolledFiltered = enrolledCourses.filter(
      (c) => c.title.toLowerCase().includes(lowerSearch) || c.description.toLowerCase().includes(lowerSearch),
    )
    const completedFiltered = completedCourses.filter(
      (c) => c.title.toLowerCase().includes(lowerSearch) || c.description.toLowerCase().includes(lowerSearch),
    )
    setFilteredEnrolled(enrolledFiltered)
    setFilteredCompleted(completedFiltered)
  }, [searchTerm, enrolledCourses, completedCourses])

  async function loadCourses() {
    try {
      const [enrollments, courses] = await Promise.all([api.getEnrollments(), api.getCourses()])

      const userEnrollments = enrollments.filter((e: any) => e.userId === user?.id)

      const enrolled: EnrolledCourse[] = []
      const completed: EnrolledCourse[] = []

      userEnrollments.forEach((enrollment: any) => {
        const course = courses.find((c: any) => c.id === enrollment.courseId)
        if (course) {
          const courseData = {
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            image: course.image,
            progress: enrollment.progress,
            status: enrollment.status,
          }

          if (enrollment.progress === 100) {
            completed.push(courseData)
          } else {
            enrolled.push(courseData)
          }
        }
      })

      setEnrolledCourses(enrolled)
      setCompletedCourses(completed)
    } catch (error) {
      console.error("Error loading courses:", error)
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
          {showWelcome && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300">
              <CardContent className="pt-6 relative">
                <button
                  onClick={() => setShowWelcome(false)}
                  className="absolute top-4 right-4 text-blue-600 hover:text-blue-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="max-w-lg">
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">¡Bienvenido a la plataforma!</h3>
                  <p className="text-blue-800 mb-4">
                    Nos alegra tenerte con nosotros, {user?.name}. Tu cuenta ha sido creada exitosamente. Aquí podrás:
                  </p>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> Acceder a todos nuestros cursos
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> Seguir tu progreso en tiempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> Enviar actividades y recibir retroalimentación
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">✓</span> Completar tus objetivos de aprendizaje
                    </li>
                  </ul>
                  <p className="text-blue-700 mt-4 font-medium">¡Comienza ahora explorando los cursos disponibles!</p>
                </div>
              </CardContent>
            </Card>
          )}

          <h2 className="text-3xl font-bold text-slate-900 mb-8">Mis Cursos</h2>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar mis cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Cargando cursos...</div>
          ) : (
            <div className="space-y-8">
              {/* Cursos en Progreso */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Cursos en Progreso</h3>
                {filteredEnrolled.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 text-center text-slate-500">
                      {searchTerm
                        ? "No hay cursos que coincidan con tu búsqueda"
                        : "No estás inscrito en ningún curso en progreso"}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEnrolled.map((course) => (
                      <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={`/dashboard/participant/course/${course.id}`}>
                          <div className="h-40 overflow-hidden rounded-t-lg">
                            <img
                              src={course.image || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Progreso</span>
                                <span className="text-sm font-bold text-slate-900">{course.progress}%</span>
                              </div>
                              <Progress value={course.progress} className="h-2" />
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Cursos Completados */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Cursos Completados</h3>
                {filteredCompleted.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 text-center text-slate-500">
                      {searchTerm ? "No hay cursos completados que coincidan" : "Aún no has completado ningún curso"}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompleted.map((course) => (
                      <Card key={course.id} className="border-green-200 bg-green-50">
                        <Link href={`/dashboard/participant/course/${course.id}`}>
                          <div className="h-40 overflow-hidden rounded-t-lg relative">
                            <img
                              src={course.image || "/placeholder.svg"}
                              alt={course.title}
                              className="w-full h-full object-cover opacity-75"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <AwardIcon className="w-12 h-12 text-green-500" />
                            </div>
                          </div>
                          <CardHeader>
                            <CardTitle className="line-clamp-2 text-green-700">{course.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-green-600 font-semibold">✓ Curso Completado</p>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function ParticipantDashboard() {
  return (
    <Suspense fallback={null}>
      <ParticipantDashboardContent />
    </Suspense>
  )
}
