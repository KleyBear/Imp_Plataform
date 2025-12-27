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
import { Trash2, Edit2, Users, BookOpen, BarChart3, Settings, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Course {
  id: number
  title: string
  description: string
  teacherId: number
  teacherName?: string
  category: string
  image: string
  duration: string
  students: number
  status: string
  createdAt: string
}

function CoursesPageContent() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [originalFormData, setOriginalFormData] = useState({
    title: "",
    description: "",
    category: "Programación",
    duration: "4 semanas",
    image: "",
  })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Programación",
    duration: "4 semanas",
    image: "",
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadCourses()
  }, [])

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
      const [allCourses, users] = await Promise.all([api.getCourses(), api.getUsers()])

      const coursesWithTeacher = allCourses.map((c: any) => ({
        ...c,
        teacherName: users.find((u: any) => u.id === c.teacherId)?.name || "Desconocido",
      }))

      setCourses(coursesWithTeacher)
      setFilteredCourses(coursesWithTeacher)
    } catch (error) {
      console.error("Error loading courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCourse = async () => {
    try {
      if (editingCourse) {
        const changedFields: any = {}

        if (formData.title !== originalFormData.title) {
          changedFields.title = formData.title
        }
        if (formData.description !== originalFormData.description) {
          changedFields.description = formData.description
        }
        if (formData.category !== originalFormData.category) {
          changedFields.category = formData.category
        }
        if (formData.duration !== originalFormData.duration) {
          changedFields.duration = formData.duration
        }
        if (formData.image !== originalFormData.image) {
          changedFields.image = formData.image
        }

        // Only update if there are actual changes
        if (Object.keys(changedFields).length > 0) {
          await api.updateCourse(editingCourse.id, changedFields)
        }
      } else {
        await api.createCourse({
          ...formData,
          teacherId: user?.id,
          students: 0,
          status: "active",
          createdAt: new Date().toISOString().split("T")[0],
        })
      }
      setIsDialogOpen(false)
      const resetData = {
        title: "",
        description: "",
        category: "Programación",
        duration: "4 semanas",
        image: "",
      }
      setFormData(resetData)
      setOriginalFormData({ ...resetData })
      setEditingCourse(null)
      loadCourses()
    } catch (error) {
      console.error("Error saving course:", error)
    }
  }

  const handleDeleteCourse = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      try {
        await api.deleteCourse(id)
        loadCourses()
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    const courseFormData = {
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration,
      image: course.image,
    }
    setFormData(courseFormData)
    setOriginalFormData({ ...courseFormData })
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Gestión de Cursos</h2>

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

          <Card>
            <CardHeader>
              <CardTitle>Todos los Cursos ({filteredCourses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">Cargando cursos...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
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
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-blue-50 p-2 rounded">
                            <p className="text-slate-600 text-xs">Docente</p>
                            <p className="font-bold text-blue-600 text-xs line-clamp-1">{course.teacherName}</p>
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-slate-600">Duración</p>
                            <p className="font-bold text-green-600">{course.duration}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-2">
                          <Link href={`/dashboard/admin/course/${course.id}`} className="w-full">
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Gestionar Contenido y Video
                            </Button>
                          </Link>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent border-slate-200"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Info Básica
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent border-red-100 text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Editar Curso" : "Crear Curso"}</DialogTitle>
                <DialogDescription>
                  {editingCourse ? "Actualiza los datos del curso" : "Completa los datos del curso"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del Curso</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Introducción a React"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción breve del curso"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duración</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Ej: 4 semanas"
                  />
                </div>
                <div>
                  <Label htmlFor="image">URL de Imagen</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <Button onClick={handleSaveCourse} className="w-full">
                  {editingCourse ? "Actualizar" : "Crear"} Curso
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
