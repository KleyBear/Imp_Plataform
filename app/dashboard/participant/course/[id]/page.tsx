"use client"

import type React from "react"
import { useEffect, useRef, useState, use } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileText, Video, Award, BookOpen, Zap, Settings, Upload, Trash2, ArrowLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { calculateProgress, getProgressComponents } from "@/lib/progress-calculator"
import { useAuthStore } from "@/lib/auth-store"
import { Sidebar } from "@/components/layout/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [currentProgress, setCurrentProgress] = useState(0)
  const [videoWatched, setVideoWatched] = useState(false)
  const [isMarkingVideo, setIsMarkingVideo] = useState(false)
  const [filesAccessedCount, setFilesAccessedCount] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmittingActivity, setIsSubmittingActivity] = useState(false)
  const videoRef = useRef<HTMLIFrameElement>(null)
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

  useEffect(() => {
    if (course && enrollments && submissions) {
      updateProgress()
    }
  }, [videoWatched, filesAccessedCount, submissions, course, enrollments])

  useEffect(() => {
    const handleVideoMessage = (event: MessageEvent) => {
      // Check if the message is from the YouTube iframe
      if (event.origin !== "https://www.youtube.com") return

      // YouTube API sends commands with a structure like: {"event":"onStateChange","info":0}
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data

        if (data.event === "onStateChange" && data.info === 0) {
          // info === 0 means video ended
          console.log("[v0] Video ended detected")
          if (videoRef.current && enrollments.length > 0) {
            const userEnrollment = enrollments.find((e: any) => e.courseId === Number(id) && e.userId === user?.id)
            if (userEnrollment && !videoWatched) {
              api.recordVideoView(userEnrollment.id).then(() => {
                console.log("[v0] Video marked as watched")
                setVideoWatched(true)
              })
            }
          }
        }
      } catch (e) {
        // Message is not JSON, ignore
      }
    }

    window.addEventListener("message", handleVideoMessage)
    return () => window.removeEventListener("message", handleVideoMessage)
  }, [enrollments, id, user?.id, videoWatched])

  async function loadCourseData() {
    try {
      const [courseData, allActivities, allSubmissions, allEnrollments] = await Promise.all([
        api.getCourseById(Number(id)),
        api.getActivities(Number(id)),
        api.getSubmissions(),
        api.getEnrollments(),
      ])

      setCourse(courseData)
      setActivities(allActivities)
      setEnrollments(allEnrollments)

      const userSubmissions = allSubmissions.filter(
        (s: any) => s.userId === user?.id && allActivities.some((a: any) => a.id === s.activityId),
      )
      setSubmissions(userSubmissions)

      const userEnrollment = allEnrollments.find((e: any) => e.courseId === Number(id) && e.userId === user?.id)
      if (userEnrollment) {
        setVideoWatched(userEnrollment.videoWatched || false)
        setFilesAccessedCount(userEnrollment.filesAccessedCount || 0)
      }
    } catch (error) {
      console.error("Error loading course:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function updateProgress() {
    try {
      const userEnrollment = enrollments.find((e: any) => e.courseId === Number(id) && e.userId === user?.id)

      if (!userEnrollment) return

      const progressComponents = getProgressComponents(
        enrollments,
        Number(id),
        user?.id,
        submissions,
        course?.resources?.length || 0,
        activities.length,
        videoWatched,
      )

      const newProgress = calculateProgress(progressComponents)

      if (newProgress !== userEnrollment.progress || videoWatched !== userEnrollment.videoWatched) {
        await api.updateEnrollment(userEnrollment.id, {
          progress: newProgress,
          videoWatched,
          filesAccessedCount,
        })
      }

      setCurrentProgress(newProgress)
    } catch (error) {
      console.error("Error updating progress:", error)
    }
  }

  const handleFileAccess = async () => {
    const userEnrollment = enrollments.find((e: any) => e.courseId === Number(id) && e.userId === user?.id)
    if (userEnrollment) {
      try {
        await api.recordFileAccess(userEnrollment.id)
        setFilesAccessedCount((prev) => prev + 1)
        loadCourseData()
      } catch (error) {
        console.error("Error recording file access:", error)
      }
    }
  }

  const handleMarkVideoWatched = async () => {
    const userEnrollment = enrollments.find((e: any) => e.courseId === Number(id) && e.userId === user?.id)
    if (userEnrollment && !videoWatched) {
      setIsMarkingVideo(true)
      try {
        await api.recordVideoView(userEnrollment.id)
        setVideoWatched(true)
        // Explicitly refresh to update UI and progress
        await loadCourseData()
      } catch (error) {
        console.error("Error marking video as watched:", error)
      } finally {
        setIsMarkingVideo(false)
      }
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
        files: filesData,
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
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Curso no encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={menuItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 truncate">{course.title}</h2>
                <p className="text-slate-600 line-clamp-2">{course.description}</p>
              </div>
              <Link href="/dashboard/participant" className="shrink-0">
                <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <Button variant="outline" size="icon" className="md:hidden bg-transparent">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <Card className="mb-8 bg-blue-600 text-white border-none shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Tu progreso total</p>
                    <h3 className="text-3xl font-bold">{currentProgress}%</h3>
                  </div>
                  <div className="bg-white/20 p-3 rounded-full">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <Progress value={currentProgress} className="h-2 bg-white/20" />
              </CardContent>
            </Card>

            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="bg-white border p-1 h-auto flex-wrap md:flex-nowrap">
                <TabsTrigger
                  value="content"
                  className="py-2.5 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger
                  value="activities"
                  className="py-2.5 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                >
                  <Award className="w-4 h-4 mr-2" />
                  Actividades ({activities.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Video */}
                    <Card className="overflow-hidden border-none shadow-sm">
                      <CardHeader className="border-b bg-white py-4">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-blue-600" />
                            Clase en Video
                          </div>
                          {videoWatched && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
                              Visto
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {course.videoUrl ? (
                          <div className="space-y-4">
                            <div className="aspect-video bg-slate-900">
                              <iframe
                                ref={videoRef}
                                width="100%"
                                height="100%"
                                src={getEmbedUrl(course.videoUrl) + "?enablejsapi=1"}
                                title="Video del curso"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            {!videoWatched ? (
                              <div className="p-6 bg-slate-50 border-t flex flex-col items-center gap-3">
                                <p className="text-sm text-slate-600 text-center max-w-md">
                                  El progreso se actualizará al finalizar el video. Si tienes problemas, puedes marcarlo
                                  manualmente.
                                </p>
                                <Button
                                  onClick={handleMarkVideoWatched}
                                  disabled={isMarkingVideo}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  {isMarkingVideo ? "Actualizando..." : "Marcar como Visto"}
                                </Button>
                              </div>
                            ) : (
                              <div className="p-4 bg-green-50 flex justify-center border-t">
                                <span className="flex items-center gap-2 text-sm font-semibold text-green-700">
                                  <Zap className="w-4 h-4" />
                                  ¡Video completado con éxito!
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-video bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-8">
                            <Video className="w-12 h-12 mb-2 opacity-20" />
                            <p>Este curso no cuenta con video aún</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    {/* Recursos */}
                    <Card className="border-none shadow-sm h-full">
                      <CardHeader className="border-b bg-white py-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Materiales
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {!course.resources || course.resources.length === 0 ? (
                          <div className="text-center py-8">
                            <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">Sin recursos</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Archivos ({filesAccessedCount}/{course.resources.length})
                            </p>
                            {course.resources.map((resource: any) => (
                              <div
                                key={resource.id}
                                className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <FileText className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 truncate">{resource.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">{resource.type}</p>
                                  </div>
                                </div>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={handleFileAccess}
                                  className="ml-2 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="Descargar"
                                >
                                  <Upload className="w-4 h-4 rotate-180" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activities.length === 0 ? (
                    <Card className="md:col-span-2 border-none shadow-sm py-12">
                      <CardContent className="flex flex-col items-center justify-center">
                        <Award className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">No hay actividades asignadas para este curso</p>
                      </CardContent>
                    </Card>
                  ) : (
                    activities.map((activity: any) => {
                      const userSubmission = submissions.find((s: any) => s.activityId === activity.id)
                      return (
                        <Card key={activity.id} className="border-none shadow-sm flex flex-col overflow-hidden">
                          <CardHeader className="bg-white border-b py-4">
                            <CardTitle className="text-lg flex items-center justify-between gap-4">
                              <span className="truncate">{activity.title}</span>
                              {userSubmission && (
                                <span
                                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                                    userSubmission.grade ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {userSubmission.grade ? `Nota: ${userSubmission.grade}` : "Enviado"}
                                </span>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 flex-1 flex flex-col">
                            <div className="mb-6 flex-1">
                              <Label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2 block">
                                Descripción
                              </Label>
                              <p className="text-slate-600 text-sm leading-relaxed">{activity.description}</p>
                            </div>

                            {userSubmission ? (
                              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div>
                                  <Label className="text-[10px] uppercase font-bold text-blue-600 tracking-widest mb-1 block">
                                    Tu Entrega
                                  </Label>
                                  <p className="text-sm text-slate-700">{userSubmission.content}</p>
                                </div>
                                {userSubmission.fileUrl && userSubmission.fileUrl !== "sin-archivos" && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-100">
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate">{userSubmission.fileUrl}</span>
                                  </div>
                                )}
                                {userSubmission.feedback && (
                                  <div className="mt-2 pt-3 border-t border-slate-200">
                                    <Label className="text-[10px] uppercase font-bold text-green-600 tracking-widest mb-1 block">
                                      Feedback del Docente
                                    </Label>
                                    <p className="text-xs text-slate-600 italic">"{userSubmission.feedback}"</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div
                                  onDragEnter={handleDrag}
                                  onDragLeave={handleDrag}
                                  onDragOver={handleDrag}
                                  onDrop={handleDrop}
                                  onClick={() => document.getElementById(`file-input-${activity.id}`)?.click()}
                                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                    dragActive
                                      ? "border-blue-500 bg-blue-50"
                                      : "border-slate-200 bg-slate-50 hover:border-blue-300"
                                  }`}
                                >
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                                  <p className="text-sm font-semibold text-slate-700">Subir archivos</p>
                                  <p className="text-xs text-slate-400 mt-1">Arrastra aquí o haz clic</p>
                                  <input
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id={`file-input-${activity.id}`}
                                  />
                                </div>

                                {submissionForm.activityId === activity.id && submissionForm.files.length > 0 && (
                                  <div className="space-y-2">
                                    {submissionForm.files.map((file, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                                          <span className="text-xs text-blue-900 truncate">{file.name}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-500 hover:text-red-700"
                                          onClick={() => handleRemoveFile(index)}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`content-${activity.id}`}
                                    className="text-[10px] uppercase font-bold text-slate-400 tracking-widest"
                                  >
                                    Comentarios
                                  </Label>
                                  <Textarea
                                    id={`content-${activity.id}`}
                                    placeholder="Detalles adicionales sobre tu entrega..."
                                    value={submissionForm.activityId === activity.id ? submissionForm.content : ""}
                                    onChange={(e) =>
                                      setSubmissionForm({
                                        ...submissionForm,
                                        activityId: activity.id,
                                        content: e.target.value,
                                      })
                                    }
                                    className="min-h-[80px] text-sm"
                                  />
                                </div>

                                <Button
                                  onClick={() => {
                                    if (submissionForm.activityId !== activity.id) {
                                      setSubmissionForm((prev) => ({ ...prev, activityId: activity.id }))
                                    }
                                    handleSubmitActivity()
                                  }}
                                  disabled={isSubmittingActivity}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                                >
                                  {isSubmittingActivity ? "Enviando..." : "Entregar Actividad"}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
