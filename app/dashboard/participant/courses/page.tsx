"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Zap, Award, Settings, Check, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface Course {
  id: number
  title: string
  description: string
  category: string
  image: string
  duration: string
  students: number
  teacherId: number
  teacherName?: string
  isEnrolled?: boolean
}

function CoursesPageContent() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [userEnrollments, setUserEnrollments] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "participant") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCourses()
    } else if (isAuthenticated && !user?.id) {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase()
    const filtered = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerSearch) ||
        c.description.toLowerCase().includes(lowerSearch) ||
        c.category.toLowerCase().includes(lowerSearch) ||
        c.teacherName?.toLowerCase().includes(lowerSearch),
    )
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  async function loadCourses() {
    try {
      const [allCourses, allEnrollments, users] = await Promise.all([
        api.getCourses(),
        api.getEnrollments(),
        api.getUsers(),
      ])

      const userEnrollmentIds = allEnrollments.filter((e: any) => e.userId === user?.id).map((e: any) => e.courseId)
      setUserEnrollments(userEnrollmentIds)

      const coursesWithInfo = allCourses.map((c: any) => ({
        ...c,
        teacherName: users.find((u: any) => u.id === c.teacherId)?.name || "Desconocido",
        isEnrolled: userEnrollmentIds.includes(c.id),
      }))

      setCourses(coursesWithInfo)
      setFilteredCourses(coursesWithInfo)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = async (courseId: number) => {
    try {
      const course = courses.find((c) => c.id === courseId)
      if (course) {
        await api.updateCourse(courseId, {
          students: (course.students || 0) + 1,
        })
      }

      const newEnrollment = {
        userId: user?.id,
        courseId,
        status: "enrolled",
        progress: 0,
        enrolledAt: new Date().toISOString().split("T")[0],
        videoWatched: false,
        filesAccessedCount: 0,
      }
      await api.createEnrollment(newEnrollment)
      console.log("[v0] Enrollment created:", newEnrollment)
      loadCourses()
    } catch (error) {
      console.error("Error enrolling in course:", error)
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Catálogo de Cursos</h2>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar por título, descripción, categoría o docente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Cargando cursos...</div>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-slate-500 mb-4">
                  {searchTerm
                    ? "No hay cursos que coincidan con tu búsqueda"
                    : "No hay cursos disponibles en este momento"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className={course.isEnrolled ? "border-blue-400 bg-blue-50/30" : ""}>
                  <div className="h-40 overflow-hidden rounded-t-lg relative">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    {course.isEnrolled && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Inscrito
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-slate-600 text-xs">Docente</p>
                        <p className="font-bold text-blue-600 text-xs line-clamp-1">{course.teacherName}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-slate-600 text-xs">Duración</p>
                        <p className="font-bold text-green-600 text-xs">{course.duration}</p>
                      </div>
                    </div>
                    {course.isEnrolled ? (
                      <Link href={`/dashboard/participant/course/${course.id}`} className="w-full">
                        <Button disabled className="w-full">
                          <Check className="w-4 h-4 mr-2" />
                          Ya inscrito
                        </Button>
                      </Link>
                    ) : (
                      <Button onClick={() => handleEnroll(course.id)} className="w-full">
                        Inscribirse
                      </Button>
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

export default function CoursesPage() {
  return (
    <Suspense fallback={null}>
      <CoursesPageContent />
    </Suspense>
  )
}
