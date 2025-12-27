"use client"

import type React from "react"

import { use } from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Video, Users, BarChart3, Settings, Trash2, Plus, Edit2, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { ActivityManager } from "@/components/activity-manager"

interface Course {
  id: number
  title: string
  description: string
  videoUrl: string
  resources: any[]
}

interface Participant {
  id: number
  name: string
  email: string
  avatar: string
}

const getEmbedUrl = (url: string) => {
  if (!url) return ""
  if (url.includes("youtube.com/embed/")) return url
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [isEditingVideo, setIsEditingVideo] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [resourceForm, setResourceForm] = useState({
    name: "",
    url: "",
    type: "pdf",
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "teacher") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadCourseData()
  }, [id])

  async function loadCourseData() {
    try {
      const courseData = await api.getCourseById(Number(id))
      if (courseData.teacherId !== user?.id) {
        router.push("/dashboard/teacher")
        return
      }
      setCourse(courseData)
      setVideoUrl(courseData.videoUrl || "")

      const [enrollments, users] = await Promise.all([api.getEnrollments(), api.getUsers()])

      const courseEnrollments = enrollments.filter((e: any) => e.courseId === Number(id))
      const participantList = courseEnrollments
        .map((e: any) => users.find((u: any) => u.id === e.userId))
        .filter((u: any) => u && u.role === "participant")
        .map((u: any) => ({ id: u.id, name: u.name, email: u.email, avatar: u.avatar }))

      setParticipants(participantList)
      setResources(courseData.resources || [])
    } catch (error) {
      console.error("Error loading course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "other"

        const typeMap: { [key: string]: string } = {
          pdf: "pdf",
          doc: "doc",
          docx: "doc",
          ppt: "ppt",
          pptx: "ppt",
          xls: "xls",
          xlsx: "xls",
        }

        setResourceForm({
          name: file.name.replace(/\.[^/.]+$/, ""),
          url: base64,
          type: typeMap[fileExtension] || "other",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddResource = async () => {
    if (!resourceForm.name || !resourceForm.url) {
      alert("Por favor completa todos los campos")
      return
    }

    const newResource = {
      id: Date.now(),
      ...resourceForm,
    }

    const updatedResources = [...resources, newResource]
    try {
      await api.updateCourse(Number(id), {
        resources: updatedResources,
      })
      setResources(updatedResources)
      setResourceForm({ name: "", url: "", type: "pdf" })
      setIsAddingResource(false)
    } catch (error) {
      console.error("Error adding resource:", error)
    }
  }

  const handleDeleteResource = async (resourceId: number) => {
    const updatedResources = resources.filter((r: any) => r.id !== resourceId)
    try {
      await api.updateCourse(Number(id), {
        resources: updatedResources,
      })
      setResources(updatedResources)
    } catch (error) {
      console.error("Error deleting resource:", error)
    }
  }

  const handleUpdateVideo = async () => {
    if (!videoUrl) {
      alert("Por favor ingresa una URL de video")
      return
    }

    try {
      await api.updateCourse(Number(id), {
        videoUrl: videoUrl,
      })
      setCourse(course ? { ...course, videoUrl } : null)
      setIsEditingVideo(false)
      alert("Video actualizado correctamente")
    } catch (error) {
      console.error("Error updating video:", error)
      alert("Error al actualizar el video")
    }
  }

  const menuItems = [
    { title: "Dashboard", href: "/dashboard/teacher", icon: <BarChart3 className="w-5 h-5" /> },
    { title: "Participantes", href: "/dashboard/teacher/participants", icon: <Users className="w-5 h-5" /> },
    { title: "Configuración", href: "/dashboard/teacher/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar items={menuItems} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar items={menuItems} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Curso no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={menuItems} />
      <div className="flex-1 md:ml-0 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 mt-12 md:mt-0">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{course.title}</h2>
              <p className="text-slate-600">{course.description}</p>
            </div>
            <Link href="/dashboard/teacher">
              <Button variant="outline">Volver</Button>
            </Link>
          </div>

          <Tabs defaultValue="content" className="space-y-4">
            <TabsList>
              <TabsTrigger value="content">
                <Video className="w-4 h-4 mr-2" />
                Contenido
              </TabsTrigger>
              <TabsTrigger value="activities">
                <FileText className="w-4 h-4 mr-2" />
                Actividades
              </TabsTrigger>
              <TabsTrigger value="participants">
                <Users className="w-4 h-4 mr-2" />
                Participantes ({participants.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Video */}
              <Card>
                <CardHeader className="flex items-center justify-between flex-row">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video del Curso
                  </CardTitle>
                  <Dialog open={isEditingVideo} onOpenChange={setIsEditingVideo}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Cambiar Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cambiar Video del Curso</DialogTitle>
                        <DialogDescription>Ingresa la URL del nuevo video (YouTube embed)</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="vurl">URL del Video</Label>
                          <Input
                            id="vurl"
                            placeholder="https://www.youtube.com/embed/..."
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleUpdateVideo} className="w-full">
                          Actualizar Video
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {course?.videoUrl ? (
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src={getEmbedUrl(course.videoUrl)}
                        title="Video del curso"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                      Sin video asignado
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recursos Complementarios */}
              <Card>
                <CardHeader className="flex items-center justify-between flex-row">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recursos Complementarios
                  </CardTitle>
                  <Dialog open={isAddingResource} onOpenChange={setIsAddingResource}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Recurso
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Agregar Recurso Complementario</DialogTitle>
                        <DialogDescription>Arrastra un archivo o completa los datos manualmente</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                            dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"
                          }`}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm font-medium text-slate-700">
                            Arrastra un archivo aquí o haz clic para seleccionar
                          </p>
                          <p className="text-xs text-slate-500 mt-1">PDF, Word, PowerPoint, etc.</p>
                        </div>

                        <div>
                          <Label htmlFor="rname">Nombre del Recurso</Label>
                          <Input
                            id="rname"
                            placeholder="Ej: Guía de Estudio"
                            value={resourceForm.name}
                            onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="rurl">URL del Recurso</Label>
                          <Input
                            id="rurl"
                            placeholder="https://..."
                            value={resourceForm.url}
                            onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="rtype">Tipo</Label>
                          <select
                            id="rtype"
                            value={resourceForm.type}
                            onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-md"
                          >
                            <option value="pdf">PDF</option>
                            <option value="doc">Word</option>
                            <option value="ppt">PowerPoint</option>
                            <option value="other">Otro</option>
                          </select>
                        </div>
                        <Button onClick={handleAddResource} className="w-full">
                          Agregar Recurso
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {resources.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No hay recursos agregados</p>
                  ) : (
                    <div className="space-y-2">
                      {resources.map((resource: any) => (
                        <div
                          key={resource.id}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-slate-50 transition"
                        >
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 flex-1 hover:text-blue-600"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                            <div>
                              <span className="font-medium text-slate-900">{resource.name}</span>
                              <span className="text-xs text-slate-500 ml-2 uppercase">{resource.type}</span>
                            </div>
                          </a>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="space-y-6">
              <ActivityManager courseId={Number(id)} />
            </TabsContent>

            <TabsContent value="participants">
              <Card>
                <CardHeader>
                  <CardTitle>Participantes Inscritos ({participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No hay participantes inscritos</p>
                  ) : (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={participant.avatar || "/placeholder.svg"}
                              alt={participant.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-slate-900">{participant.name}</p>
                              <p className="text-sm text-slate-500">{participant.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
