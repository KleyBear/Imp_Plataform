"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Calendar, FileText, Loader2, AlertCircle, Upload } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Activity {
  id: number
  courseId: number
  title: string
  description: string
  dueDate?: string
  attachmentUrl?: string
  attachmentName?: string
}

interface ActivityManagerProps {
  courseId: number
}

export function ActivityManager({ courseId }: ActivityManagerProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    dueDate: "",
    attachmentUrl: "",
    attachmentName: "",
  })

  const isValidFutureDate = (dateString: string): boolean => {
    const selectedDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }

  const getMinDate = (): string => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  useEffect(() => {
    loadActivities()
    const interval = setInterval(loadActivities, 3000)
    return () => clearInterval(interval)
  }, [courseId])

  async function loadActivities() {
    try {
      setIsLoading(true)
      setError(null)
      const allActivities = await api.getActivities()
      const courseActivities = allActivities.filter((a: any) => a.courseId === courseId)
      setActivities(courseActivities)
    } catch (error) {
      console.error("[v0] Error loading activities:", error)
      setError("Error al cargar las actividades. Intenta de nuevo.")
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setNewActivity({
          ...newActivity,
          attachmentUrl: base64,
          attachmentName: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newActivity.title || !newActivity.description) {
      setError("Por favor completa los campos obligatorios (Título y Descripción)")
      return
    }

    if (newActivity.dueDate && !isValidFutureDate(newActivity.dueDate)) {
      setError("La fecha de entrega debe ser igual o posterior a hoy")
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const activity = await api.createActivity({
        ...newActivity,
        courseId,
        submissions: [],
      })
      setActivities([...activities, activity])
      setNewActivity({ title: "", description: "", dueDate: "", attachmentUrl: "", attachmentName: "" })
      setIsAdding(false)
    } catch (error) {
      console.error("[v0] Error creating activity:", error)
      setError("Error al crear la actividad. Intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteActivity = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta actividad? Los datos se perderán.")) {
      try {
        setError(null)
        await api.deleteActivity(id)
        setActivities(activities.filter((a) => a.id !== id))
      } catch (error) {
        console.error("[v0] Error deleting activity:", error)
        setError("Error al eliminar la actividad. Intenta de nuevo.")
      }
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Actividades del Curso
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona las tareas y ejercicios para tus alumnos. Se actualiza en tiempo real.
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isAdding && (
          <Card className="mb-6 bg-slate-50 border-slate-200">
            <CardContent className="pt-6">
              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="act-title">Título de la Actividad</Label>
                  <Input
                    id="act-title"
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                    placeholder="Ej: Tarea 1: Fundamentos de React"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="act-desc">Descripción / Instrucciones</Label>
                  <Textarea
                    id="act-desc"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    placeholder="Detalla lo que el estudiante debe realizar..."
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="act-date">Fecha de Entrega (opcional)</Label>
                  <Input
                    id="act-date"
                    type="date"
                    value={newActivity.dueDate}
                    onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })}
                    min={getMinDate()}
                  />
                  <p className="text-xs text-slate-500">
                    Selecciona una fecha igual o posterior a hoy (dejar en blanco si no tiene fecha límite)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Archivo de Referencia (opcional)</Label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                      dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"
                    }`}
                  >
                    <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">
                      Arrastra un archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF, Word, imágenes, etc.</p>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0]
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string
                            setNewActivity({
                              ...newActivity,
                              attachmentUrl: base64,
                              attachmentName: file.name,
                            })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer block mt-2">
                      <span className="sr-only">Seleccionar archivo</span>
                    </label>
                  </div>
                  {newActivity.attachmentName && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-900">{newActivity.attachmentName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewActivity({ ...newActivity, attachmentUrl: "", attachmentName: "" })}
                        className="ml-auto"
                      >
                        Quitar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      setIsAdding(false)
                      setError(null)
                      setNewActivity({ title: "", description: "", dueDate: "", attachmentUrl: "", attachmentName: "" })
                    }}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creando...
                      </>
                    ) : (
                      "Crear Actividad"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
              <p className="text-sm text-slate-500">Cargando actividades...</p>
            </div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-3">No hay actividades creadas para este curso.</p>
            {!isAdding && (
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700" onClick={() => setIsAdding(true)}>
                Crear la primera actividad
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group flex items-start justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all duration-200"
              >
                <div className="space-y-2 flex-1">
                  <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{activity.description}</p>
                  <div className="flex items-center gap-4 pt-1">
                    {activity.dueDate && (
                      <span className="flex items-center text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                        Entrega: {format(new Date(activity.dueDate), "dd MMM, yyyy", { locale: es })}
                      </span>
                    )}
                    {activity.attachmentName && (
                      <a
                        href={activity.attachmentUrl}
                        download={activity.attachmentName}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        {activity.attachmentName}
                      </a>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-600 h-8 w-8 ml-4 flex-shrink-0"
                  onClick={() => handleDeleteActivity(activity.id)}
                  title="Eliminar actividad"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
