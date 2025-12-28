"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, Settings, FileText, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CourseParticipants {
  courseId: number
  courseName: string
  participants: {
    participantId: number
    participantName: string
    email: string
    avatar: string
    progress: number
    submissions: any[]
  }[]
}

export default function ParticipantsPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [courseParticipants, setCourseParticipants] = useState<CourseParticipants[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [gradingSubmission, setGradingSubmission] = useState<any>(null)
  const [gradeValue, setGradeValue] = useState("")
  const [feedbackValue, setFeedbackValue] = useState("")
  const [viewingSubmission, setViewingSubmission] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "teacher") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    loadParticipantData()
  }, [user])

  async function loadParticipantData() {
    try {
      const [teacherCourses, enrollments, users, submissions, allActivities] = await Promise.all([
        api.getCourses(),
        api.getEnrollments(),
        api.getUsers(),
        api.getSubmissions(),
        api.getActivities(),
      ])

      setActivities(allActivities)

      const teacherCourseList = teacherCourses.filter((c: any) => c.teacherId === user?.id)

      const data: CourseParticipants[] = teacherCourseList.map((course: any) => {
        const courseEnrollments = enrollments.filter((e: any) => e.courseId === course.id)
        const participants = courseEnrollments
          .map((e: any) => {
            const participant = users.find((u: any) => u.id === e.userId)
            if (participant && participant.role === "participant") {
              const participantSubmissions = submissions.filter(
                (s: any) => s.userId === e.userId && s.courseId === course.id,
              )
              const enrichedSubmissions = participantSubmissions.map((s: any) => {
                const activity = allActivities.find((a: any) => a.id === s.activityId)
                return {
                  ...s,
                  activityTitle: activity?.title || `Actividad #${s.activityId}`,
                }
              })

              return {
                participantId: e.userId,
                participantName: participant.name,
                email: participant.email,
                avatar: participant.avatar,
                progress: e.progress || 0,
                submissions: enrichedSubmissions,
              }
            }
            return null
          })
          .filter(Boolean)

        return {
          courseId: course.id,
          courseName: course.title,
          participants,
        }
      })

      setCourseParticipants(data)
    } catch (error) {
      console.error("Error loading participant data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitGrade = async () => {
    if (!gradeValue || isNaN(Number(gradeValue))) {
      alert("Por favor ingresa una calificación válida")
      return
    }

    const grade = Number(gradeValue)
    if (grade < 0 || grade > 100) {
      alert("La calificación debe estar entre 0 y 100")
      return
    }

    try {
      await api.updateSubmission(gradingSubmission.id, {
        grade: grade,
        feedback: feedbackValue,
      })
      setGradingSubmission(null)
      setGradeValue("")
      setFeedbackValue("")
      loadParticipantData()
      alert("Calificación guardada correctamente")
    } catch (error) {
      console.error("Error updating grade:", error)
      alert("Error al guardar la calificación")
    }
  }

  const normalizeFileData = (data: string, type: string) => {
    if (!data) return ""
    // If it's already a data URL, return as is
    if (data.startsWith("data:")) return data
    // If it's raw base64, add the prefix using the provided type
    return `data:${type || "application/octet-stream"};base64,${data}`
  }

  const getSubmissionFiles = (submission: any) => {
    // Case 1: Modern submissions with files array containing base64 data
    if (submission.files && Array.isArray(submission.files) && submission.files.length > 0) {
      console.log("[v0] Found files array with", submission.files.length, "files")
      return submission.files.map((file: any) => {
        if (!file.data) {
          console.warn("[v0] File missing data property:", file.name)
        }
        return {
          ...file,
          data: normalizeFileData(file.data || "", file.type),
        }
      })
    }

    // Case 2: No files or legacy submissions - try to reconstruct from fileUrl
    if (!submission.fileUrl || submission.fileUrl === "sin-archivos") {
      console.log("[v0] No files found for submission", submission.id)
      return []
    }

    console.log("[v0] Attempting to reconstruct files from fileUrl for submission", submission.id)

    // Parse file names from comma-separated string
    return submission.fileUrl.split(", ").map((name: string) => {
      // Try to find file data in the files array (partial data case)
      const existingFile = submission.files?.find((f: any) => f.name === name)

      // Extract file type from various sources
      const fileType = existingFile?.type || submission.content?.match(/data:(.*?);/)?.[1] || "application/octet-stream"

      // Try to get raw data from multiple sources
      let rawData = ""
      if (existingFile?.data) {
        rawData = existingFile.data
      } else if (submission.content?.startsWith("data:")) {
        // Fallback: check if content field contains the base64 data
        rawData = submission.content
      }

      if (!rawData) {
        console.warn("[v0] No file data found for:", name, "in submission", submission.id)
      }

      return {
        name,
        type: fileType,
        data: normalizeFileData(rawData, fileType),
      }
    })
  }

  const handleFileDownload = (file: any) => {
    if (!file.data) {
      alert("El archivo no está disponible. Es posible que esta entrega sea de una versión anterior del sistema.")
      return
    }
    try {
      const dataUrl = file.data.startsWith("data:") ? file.data : normalizeFileData(file.data, file.type)
      const [header, base64Data] = dataUrl.split(",")

      if (!base64Data) {
        throw new Error("Invalid data format")
      }

      const mimeMatch = header.match(/data:(.*?);/)
      const mimeType = mimeMatch ? mimeMatch[1] : file.type || "application/octet-stream"

      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: mimeType })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error("[v0] Error processing download:", e)
      alert("Error al descargar el archivo. Por favor contacta al administrador.")
    }
  }

  const filteredCourses = courseParticipants.filter((cp) => {
    const courseMatches = cp.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    const participantMatches = cp.participants.some(
      (p) =>
        p.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    return courseMatches || participantMatches
  })

  const menuItems = [
    { title: "Dashboard", href: "/dashboard/teacher", icon: <BarChart3 className="w-5 h-5" /> },
    { title: "Participantes", href: "/dashboard/teacher/participants", icon: <Users className="w-5 h-5" /> },
    { title: "Configuración", href: "/dashboard/teacher/settings", icon: <Settings className="w-5 h-5" /> },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar items={menuItems} />
      <div className="flex-1 md:ml-0 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 mt-12 md:mt-0">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Mis Participantes y Actividades</h2>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar por curso o nombre de participante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Cargando datos...</div>
          ) : filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-slate-500">No hay participantes inscritos aún</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredCourses.map((courseData) => (
                <Card key={courseData.courseId}>
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-blue-900">{courseData.courseName}</CardTitle>
                    <p className="text-sm text-blue-700 mt-2">{courseData.participants.length} participante(s)</p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {courseData.participants.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No hay participantes en este curso</p>
                    ) : (
                      <div className="space-y-4">
                        {courseData.participants.map((participant) => (
                          <div key={participant.participantId} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={participant.avatar || "/placeholder.svg"}
                                  alt={participant.participantName}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div>
                                  <p className="font-medium text-slate-900">{participant.participantName}</p>
                                  <p className="text-sm text-slate-500">{participant.email}</p>
                                  <div className="mt-2 w-48">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                      <span>PROGRESO</span>
                                      <span>{participant.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${participant.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm font-semibold text-blue-600">
                                {participant.submissions.length} entrega(s)
                              </span>
                            </div>

                            {participant.submissions.length === 0 ? (
                              <p className="text-slate-500 text-sm">Sin entregas aún</p>
                            ) : (
                              <div className="space-y-2">
                                {participant.submissions.map((submission: any) => (
                                  <div key={submission.id} className="bg-slate-50 p-3 rounded text-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium text-slate-900">{submission.activityTitle}</span>
                                      </div>
                                      <span className="font-bold text-blue-600">
                                        {submission.grade !== null ? `${submission.grade}/100` : "Sin calificar"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600">Entregado: {submission.submittedAt}</p>

                                    {submission.fileUrl && submission.fileUrl !== "sin-archivos" && (
                                      <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                                        <p className="text-xs font-medium text-slate-700 mb-1">Archivos entregados:</p>
                                        <div className="space-y-2">
                                          {getSubmissionFiles(submission).map((file: any, idx: number) => {
                                            const handlePreview = () => {
                                              if (!file.data) {
                                                alert("La previsualización no está disponible")
                                                return
                                              }
                                              window.open(file.data, "_blank")
                                            }

                                            const isImage = file.type?.startsWith("image/")
                                            const isPdf = file.type === "application/pdf"

                                            return (
                                              <div
                                                key={idx}
                                                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded"
                                              >
                                                <div className="flex items-center gap-2 flex-1">
                                                  <FileText className="w-4 h-4 text-blue-600" />
                                                  <span className="text-sm text-slate-700 truncate">{file.name}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                  {(isImage || isPdf) && (
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                                      onClick={handlePreview}
                                                    >
                                                      Ver
                                                    </Button>
                                                  )}
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                                    onClick={() => handleFileDownload(file)}
                                                  >
                                                    Descargar
                                                  </Button>
                                                </div>
                                              </div>
                                            )
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {submission.content && !submission.content.startsWith("data:") && (
                                      <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                                        <p className="text-xs font-medium text-slate-700 mb-1">Contenido:</p>
                                        <p className="text-xs text-slate-600 line-clamp-2">{submission.content}</p>
                                      </div>
                                    )}

                                    <div className="flex gap-2 mt-3">
                                      {(submission.fileUrl !== "sin-archivos" || submission.content) && (
                                        <Dialog
                                          open={viewingSubmission?.id === submission.id}
                                          onOpenChange={(open) => {
                                            if (!open) {
                                              setViewingSubmission(null)
                                            }
                                          }}
                                        >
                                          <DialogTrigger asChild>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                              onClick={() => setViewingSubmission(submission)}
                                            >
                                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                                              Ver Entrega
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                              <DialogTitle>Detalle de Entrega - {submission.activityTitle}</DialogTitle>
                                              <DialogDescription>Entregado: {submission.submittedAt}</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              {submission.content && !submission.content.startsWith("data:") && (
                                                <div>
                                                  <Label className="text-base font-semibold">Contenido:</Label>
                                                  <div className="mt-2 p-4 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap text-sm text-slate-700 max-h-64 overflow-y-auto">
                                                    {submission.content}
                                                  </div>
                                                </div>
                                              )}

                                              {submission.fileUrl && submission.fileUrl !== "sin-archivos" && (
                                                <div>
                                                  <Label className="text-base font-semibold mb-2 block">
                                                    Archivos Entregados:
                                                  </Label>
                                                  <div className="space-y-2">
                                                    {getSubmissionFiles(submission).map((file: any, idx: number) => {
                                                      const handlePreview = () => {
                                                        if (!file.data) {
                                                          alert("La previsualización no está disponible")
                                                          return
                                                        }
                                                        window.open(file.data, "_blank")
                                                      }

                                                      const isImage = file.type?.startsWith("image/")
                                                      const isPdf = file.type === "application/pdf"

                                                      return (
                                                        <div
                                                          key={idx}
                                                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded"
                                                        >
                                                          <div className="flex items-center gap-2 flex-1">
                                                            <FileText className="w-4 h-4 text-blue-600" />
                                                            <span className="text-sm text-slate-700 truncate">
                                                              {file.name}
                                                            </span>
                                                          </div>
                                                          <div className="flex gap-2">
                                                            {(isImage || isPdf) && (
                                                              <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                                                onClick={handlePreview}
                                                              >
                                                                Ver
                                                              </Button>
                                                            )}
                                                            <Button
                                                              size="sm"
                                                              variant="ghost"
                                                              className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                                              onClick={() => handleFileDownload(file)}
                                                            >
                                                              Descargar
                                                            </Button>
                                                          </div>
                                                        </div>
                                                      )
                                                    })}
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      )}

                                      <Dialog
                                        open={gradingSubmission?.id === submission.id}
                                        onOpenChange={(open) => {
                                          if (!open) {
                                            setGradingSubmission(null)
                                            setGradeValue("")
                                            setFeedbackValue("")
                                          }
                                        }}
                                      >
                                        <DialogTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-blue-50"
                                            onClick={() => {
                                              setGradingSubmission(submission)
                                              setGradeValue(String(submission.grade || ""))
                                              setFeedbackValue(submission.feedback || "")
                                            }}
                                          >
                                            Calificar
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                          <DialogHeader>
                                            <DialogTitle>Calificar Entrega</DialogTitle>
                                            <DialogDescription>
                                              Calificación para {participant.participantName}
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor="grade">Calificación (0-100)</Label>
                                              <Input
                                                id="grade"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={gradeValue}
                                                onChange={(e) => setGradeValue(e.target.value)}
                                                placeholder="85"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor="feedback">Retroalimentación (opcional)</Label>
                                              <Textarea
                                                id="feedback"
                                                value={feedbackValue}
                                                onChange={(e) => setFeedbackValue(e.target.value)}
                                                placeholder="Comenta sobre el trabajo del estudiante..."
                                                rows={3}
                                              />
                                            </div>
                                            <Button onClick={handleSubmitGrade} className="w-full">
                                              Guardar Calificación
                                            </Button>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
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
