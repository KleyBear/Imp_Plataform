"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Settings, BarChart3, PlayCircle } from "lucide-react"
import { TutorialModal } from "@/components/tutorial/tutorial-modal"

interface TutorialSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  steps: Array<{
    title: string
    description: string
    details: string[]
  }>
}

const TEACHER_TUTORIALS: TutorialSection[] = [
  {
    id: "dashboard",
    title: "Mi Dashboard de Docente",
    description: "Maneja tu panel principal",
    icon: <BarChart3 className="w-6 h-6" />,
    steps: [
      {
        title: "Vista General",
        description: "Comprende tu espacio de trabajo como docente",
        details: [
          "Visualiza todos tus cursos en una lista organizada",
          "Ve información importante: título, descripción, categoría",
          "Número de estudiantes inscritos en cada curso",
          "Estado y fecha de creación de cada curso",
        ],
      },
      {
        title: "Buscar y Filtrar",
        description: "Encuentra cursos específicos rápidamente",
        details: [
          "Usa la barra de búsqueda por nombre del curso",
          "Filtra por descripción o categoría",
          "Ordena cursos por fecha o número de estudiantes",
          "Busca cursos en progreso o completados",
        ],
      },
      {
        title: "Información de Estudiantes",
        description: "Monitorea el progreso de tus alumnos",
        details: [
          "Visualiza cuántos estudiantes hay en cada curso",
          "Accede a información de progreso del grupo",
          "Identifica estudiantes con bajo desempeño",
          "Toma acciones para mejorar resultados",
        ],
      },
    ],
  },
  {
    id: "create-course",
    title: "Crear y Editar Cursos",
    description: "Desarrolla nuevos cursos",
    icon: <BookOpen className="w-6 h-6" />,
    steps: [
      {
        title: "Crear un Nuevo Curso",
        description: "Inicia la creación de un nuevo curso",
        details: [
          "Haz clic en el botón 'Crear Curso'",
          "Se abrirá un formulario con campos a completar",
          "Rellena toda la información requerida",
          "Guarda el curso para que esté disponible a estudiantes",
        ],
      },
      {
        title: "Completar Datos del Curso",
        description: "Llena los datos esenciales del curso",
        details: [
          "Título: Nombre atractivo y descriptivo del curso",
          "Descripción: Explica qué aprenderán los estudiantes",
          "Categoría: Clasifica el curso (Programación, Negocios, etc.)",
          "Duración: Especifica el tiempo estimado (ej: 4 semanas)",
        ],
      },
      {
        title: "Agregar Imagen y Detalles",
        description: "Personaliza la apariencia de tu curso",
        details: [
          "Imagen: URL de una imagen representativa del curso",
          "La imagen se mostrará en la tarjeta del curso",
          "Elige imágenes atractivas que llamen la atención",
          "Asegúrate que sea relevante al contenido",
        ],
      },
      {
        title: "Editar Cursos Existentes",
        description: "Modifica cursos ya creados",
        details: [
          "Haz clic en el icono de lápiz (editar) en el curso",
          "Modifica los campos que necesites actualizar",
          "Los cambios se guardan automáticamente",
          "Los estudiantes verán las actualizaciones inmediatamente",
        ],
      },
      {
        title: "Eliminar Cursos",
        description: "Elimina cursos si es necesario",
        details: [
          "Haz clic en el icono de papelera (eliminar)",
          "Se pedirá confirmación antes de eliminar",
          "La acción es irreversible, ten cuidado",
          "Los estudiantes serán desincritos automáticamente",
        ],
      },
    ],
  },
  {
    id: "participants",
    title: "Gestión de Participantes",
    description: "Administra tus estudiantes",
    icon: <Users className="w-6 h-6" />,
    steps: [
      {
        title: "Ver Lista de Participantes",
        description: "Accede a todos tus estudiantes",
        details: [
          "Ve la lista completa de estudiantes inscritos",
          "Información: nombre, email, estado de inscripción",
          "Progreso de cada estudiante en el curso",
          "Fecha de inscripción y última actividad",
        ],
      },
      {
        title: "Monitorear Progreso",
        description: "Sigue el avance de tus estudiantes",
        details: [
          "Visualiza el porcentaje de progreso por estudiante",
          "Identifica quién va rezagado o necesita ayuda",
          "Ve qué módulos han completado",
          "Toma acciones para motivar a estudiantes",
        ],
      },
      {
        title: "Comunicación",
        description: "Interactúa con tus estudiantes",
        details: [
          "Envía mensajes personalizados a estudiantes",
          "Publica anuncios para toda la clase",
          "Responde preguntas y dudas rápidamente",
          "Mantén comunicación clara y profesional",
        ],
      },
      {
        title: "Evaluación y Retroalimentación",
        description: "Evalúa el desempeño de estudiantes",
        details: [
          "Revisa actividades y trabajos enviados",
          "Proporciona calificaciones justas",
          "Escribe comentarios constructivos",
          "Ayuda a estudiantes a mejorar su desempeño",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Configuración de Perfil",
    description: "Personaliza tu cuenta",
    icon: <Settings className="w-6 h-6" />,
    steps: [
      {
        title: "Información Personal",
        description: "Actualiza tus datos",
        details: [
          "Edita tu nombre completo",
          "Actualiza tu email de contacto",
          "Carga una foto de perfil profesional",
          "Añade información biográfica relevante",
        ],
      },
      
      {
        title: "Privacidad y Seguridad",
        description: "Protege tu cuenta",
        details: [
          "Cambia tu contraseña regularmente",
          "Activa autenticación de dos factores",
          "Revisa dispositivos conectados",
          "Establece permisos de privacidad",
        ],
      },
    ],
  },
]

export default function TeacherTutorialPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialSection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStartTutorial = (tutorial: TutorialSection) => {
    setSelectedTutorial(tutorial)
    setIsModalOpen(true)
  }

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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Tutorial para Docentes</h1>
            <p className="text-lg text-slate-600">
              Domina todas las funciones disponibles para crear y gestionar tus cursos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEACHER_TUTORIALS.map((tutorial) => (
              <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-blue-600">{tutorial.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{tutorial.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handleStartTutorial(tutorial)} className="w-full gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Iniciar Tutorial ({tutorial.steps.length} pasos)
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      {selectedTutorial && (
        <TutorialModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedTutorial.title}
          steps={selectedTutorial.steps}
        />
      )}
    </div>
  )
}
