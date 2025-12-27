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
import { Label } from "@/components/ui/label"
import { FileText, Video, Award, BookOpen, Zap, Settings, Upload, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"

interface Course {
  id: number
  title: string
  description: string
  videoUrl?: string
  resources: any[]
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
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [submissionForm, setSubmissionForm] = useState({
    activityId: 0,
    content: "",
    files: [] as File[],
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "participant") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadCourseData()
  }, [id])

  async function loadCourseData() {
    try {
      const courseData = await api.getCourseById(Number(id))
      setCourse(courseData)

      const allActivities = await api.getActivities(Number(id))
      setActivities(allActivities)

      const allSubmissions = await api.getSubmissions()
      const userSubmissions = allSubmissions.filter(
        (s: any) => s.userId === user?.id && allActivities.some((a: any) => a.id === s.activityId),
      )
      setSubmissions(userSubmissions)
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

    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setSubmissionForm({ ...submissionForm, files: [...submissionForm.files, ...newFiles] })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSubmissionForm({ ...submissionForm, files: [...submissionForm.files, ...newFiles] })
    }
  }

  const handleRemoveFile = (index: number) => {
    const updatedFiles = submissionForm.files.filter((_, i) => i !== index)
    setSubmissionForm({ ...submissionForm, files: updatedFiles })
  }

  const handleSubmitActivity = async () => {
    if (!submissionForm.content && submissionForm.files.length === 0) {
      alert("Por favor agrega contenido o un archivo")
      return
    }

    setIsSubmittingActivity(true)
    try {
      const filesData: Array<{ name: string; data: string; type: string }> = []

      for (const file of submissionForm.files) {
        const data = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        filesData.push({
          name: file.name,
          data,
          type: file.type,
        })
      }

      await api.createSubmission({
        id: Date.now(),
        userId: user?.id,
        courseId: Number(id),
        activityId: submissionForm.activityId,
        content: submissionForm.content,
        fileUrl: submissionForm.files.map((f) => f.name).join(", ") || "sin-archivos",
        files: filesData, // Store full file data with base64
        submittedAt: new Date().toISOString().split("T")[0],
        grade: null,
        feedback: "",
      })
      setSubmissionForm({ activityId: 0, content: "", files: [] })
      alert("Actividad entregada exitosamente")
      loadCourseData()
    } catch (error) {
      console.error("Error submitting activity:", error)
      alert("Error al entregar la actividad")
    } finally {
      setIsSubmittingActivity(false)
    }
  }

  const menuItems = [
    { title: "Mis Cursos", href: "/dashboard/participant", icon: <BookOpen className="w-5 h-5" /> },
    { title: "Cursos Disponibles", href: "/dashboard/participant/courses", icon: <Zap className="w-5 h-5" /> },
    { title: "Actividades", href: "/dashboard/participant/activities", icon: <Award className="w-5 h-5" /> },
    { title: "Configuración", href: "/dashboard/participant/settings", icon: <Settings className="w-5 h-5" /> },
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
            <Link href="/dashboard/participant">
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
                <Award className="w-4 h-4 mr-2" />
                Actividades ({activities.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Video */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Video del Curso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {course.videoUrl ? (
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recursos Complementarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!course.resources || course.resources.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No hay recursos disponibles</p>
                  ) : (
                    <div className="space-y-2">
                      {course.resources.map((resource: any) => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 border border-slate-200 rounded hover:bg-blue-50 transition"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <div>
                              <span className="font-medium text-slate-900">{resource.name}</span>
                              <span className="text-xs text-slate-500 ml-2 uppercase">{resource.type}</span>
                            </div>
                          </div>
                          <span className="text-blue-600 hover:text-blue-700">Descargar</span>
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities">
              <div className="space-y-6">
                {activities.length === 0 ? (
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <p className="text-slate-500">No hay actividades disponibles en este curso</p>
                    </CardContent>
                  </Card>
                ) : (
                  activities.map((activity: any) => {
                    const userSubmission = submissions.find((s: any) => s.activityId === activity.id)
                    return (
                      <Card key={activity.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{activity.title}</span>
                            {userSubmission && (
                              <span
                                className={`text-sm font-medium px-3 py-1 rounded ${
                                  userSubmission.grade ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {userSubmission.grade ? `Calificación: ${userSubmission.grade}/100` : "Pendiente"}
                              </span>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm text-slate-600">Descripción</Label>
                            <p className="text-slate-900">{activity.description}</p>
                          </div>

                          {userSubmission && (
                            <div className="space-y-2 bg-slate-50 p-4 rounded">
                              <Label className="text-sm font-semibold">Tu Entrega</Label>
                              <p className="text-sm text-slate-700">{userSubmission.content}</p>
                              {userSubmission.fileUrl && userSubmission.fileUrl !== "sin-archivos" && (
                                <p className="text-xs text-slate-600">
                                  <strong>Archivos:</strong> {userSubmission.fileUrl}
                                </p>
                              )}
                              {userSubmission.feedback && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <Label className="text-sm font-semibold text-blue-600">
                                    Retroalimentación del Docente
                                  </Label>
                                  <p className="text-sm text-slate-700">{userSubmission.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {!userSubmission && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  onClick={() => setSubmissionForm({ ...submissionForm, activityId: activity.id })}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Entregar Actividad
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Entregar Actividad: {activity.title}</DialogTitle>
                                  <DialogDescription>Arrastra archivos o completa la actividad</DialogDescription>
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
                                      Arrastra archivos aquí o haz clic para seleccionar
                                    </p>
                                    <input
                                      type="file"
                                      multiple
                                      onChange={handleFileSelect}
                                      className="hidden"
                                      id="file-input"
                                    />
                                    <label htmlFor="file-input" className="cursor-pointer">
                                      <span className="text-xs text-slate-500 mt-1 block">
                                        PDF, Word, imágenes, etc.
                                      </span>
                                    </label>
                                  </div>

                                  {submissionForm.files.length > 0 && (
                                    <div className="space-y-2">
                                      <Label>Archivos seleccionados:</Label>
                                      <div className="space-y-2">
                                        {submissionForm.files.map((file, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border border-slate-200 rounded"
                                          >
                                            <div className="flex items-center gap-2">
                                              <FileText className="w-4 h-4 text-blue-600" />
                                              <span className="text-sm text-slate-700">{file.name}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)}>
                                              <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div>
                                    <Label htmlFor="content">Tu Respuesta</Label>
                                    <Textarea
                                      id="content"
                                      placeholder="Escribe tu respuesta aquí..."
                                      value={submissionForm.content}
                                      onChange={(e) =>
                                        setSubmissionForm({ ...submissionForm, content: e.target.value })
                                      }
                                      className="min-h-[100px]"
                                    />
                                  </div>
                                  <Button
                                    onClick={handleSubmitActivity}
                                    disabled={isSubmittingActivity}
                                    className="w-full"
                                  >
                                    {isSubmittingActivity ? "Entregando..." : "Entregar Actividad"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
