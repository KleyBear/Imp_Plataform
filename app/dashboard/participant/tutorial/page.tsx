"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Zap, Award, Settings, PlayCircle } from "lucide-react"
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

const PARTICIPANT_TUTORIALS: TutorialSection[] = [
  {
    id: "my-courses",
    title: "Mis Cursos",
    description: "Gestiona tus cursos inscritos",
    icon: <BookOpen className="w-6 h-6" />,
    steps: [
      {
        title: "Visualización de Cursos",
        description: "Comprende tu pantalla de cursos",
        details: [
          "Ves todos los cursos en los que estás inscrito",
          "Cursos separados en dos categorías: En Progreso y Completados",
          "Información de cada curso: título, descripción, imagen",
          "Progreso visual en forma de barra de avance",
        ],
      },
      {
        title: "Cursos en Progreso",
        description: "Continúa con tus estudios",
        details: [
          "Visualiza el porcentaje completado de cada curso",
          "Barra de progreso muestra tu avance visual",
          "Haz clic en el curso para acceder a su contenido",
          "Completa módulos y actividades para avanzar",
        ],
      },
      {
        title: "Cursos Completados",
        description: "Celebra tus logros",
        details: [
          "Ve todos los cursos que ya has terminado",
          "Distintivo de finalización en el curso (ícono de medallla)",
          "Acceso permanente al contenido completado",
          "Puedes revisar contenidos cuando lo necesites",
        ],
      },
      {
        title: "Búsqueda y Filtrado",
        description: "Encuentra cursos rápidamente",
        details: [
          "Usa la barra de búsqueda por nombre del curso",
          "Filtra por descripción o contenido",
          "Ordena cursos por fecha o progreso",
          "Busca entre tus cursos inscritos",
        ],
      },
    ],
  },
  {
    id: "available-courses",
    title: "Cursos Disponibles",
    description: "Descubre nuevos cursos",
    icon: <Zap className="w-6 h-6" />,
    steps: [
      {
        title: "Catálogo de Cursos",
        description: "Explora todos los cursos disponibles",
        details: [
          "Visualiza el catálogo completo de cursos",
          "Filtra por categoría o nivel de dificultad",
          "Lee descripciones y objetivos de cada curso",
          "Mira información del docente responsable",
        ],
      },
      {
        title: "Información de Cursos",
        description: "Aprende sobre cursos antes de inscribirte",
        details: [
          "Título y descripción detallada del curso",
          "Duración estimada y requisitos previos",
          "Número de estudiantes ya inscritos",
          "Calificación promedio del curso",
        ],
      },
      {
        title: "Inscribirse en Cursos",
        description: "Comienza un nuevo curso",
        details: [
          "Haz clic en 'Inscribirse' en el curso que te interese",
          "Confirma tu inscripción",
          "Accede inmediatamente al contenido del curso",
          "El curso aparecerá en tu sección 'Mis Cursos'",
        ],
      },
      
    ],
  },
  {
    id: "activities",
    title: "Actividades y Tareas",
    description: "Completa tus asignaciones",
    icon: <Award className="w-6 h-6" />,
    steps: [
      {
        title: "Ver Actividades",
        description: "Accede a tus tareas y actividades",
        details: [
          "Visualiza todas tus actividades pendientes",
          "Tareas por entregar ordenadas por fecha límite",
          "Descripción detallada de cada actividad",
          "Criterios de evaluación claramente establecidos",
        ],
      },
      {
        title: "Entregar Actividades",
        description: "Envía tus trabajos completados",
        details: [
          "Descarga materiales de apoyo cuando sea necesario",
          "Completa la actividad según las indicaciones",
          "Adjunta tus archivos (documentos, imágenes, etc.)",
          "Verifica que todo esté correcto antes de enviar",
        ],
      },
      {
        title: "Recibir Retroalimentación",
        description: "Mejora tu aprendizaje",
        details: [
          "Tu docente revisa tus entregas",
          "Recibirás calificación y comentarios",
          "Feedback constructivo para mejorar",
          "Oportunidad de enviar correcciones si es necesario",
        ],
      },
      {
        title: "Seguimiento de Calificaciones",
        description: "Monitorea tu desempeño",
        details: [
          "Ve todas tus calificaciones en un lugar",
          "Desglose de evaluaciones por actividad",
          "Progreso general en cada curso",
          "Promedio final del curso",
        ],
      },
    ],
  },
  {
    id: "settings",
    title: "Configuración de Perfil",
    description: "Personaliza tu experiencia",
    icon: <Settings className="w-6 h-6" />,
    steps: [
      {
        title: "Información de Perfil",
        description: "Actualiza tus datos personales",
        details: [
          "Edita tu nombre y apellido",
          "Actualiza tu email de contacto",
          "Carga una foto de perfil",
          "Añade información sobre ti y tus intereses",
        ],
      },
      
      {
        title: "Privacidad y Seguridad",
        description: "Protege tu cuenta",
        details: [
          "Cambia tu contraseña regularmente",
          "Activa autenticación de dos factores",
          "Revisa dispositivos con acceso a tu cuenta",
          "Establece nivel de privacidad de tu perfil",
        ],
      },
      
    ],
  },
]

export default function ParticipantTutorialPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialSection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStartTutorial = (tutorial: TutorialSection) => {
    setSelectedTutorial(tutorial)
    setIsModalOpen(true)
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Tutorial para Participantes</h1>
            <p className="text-lg text-slate-600">
              Aprende a usar la plataforma y aprovechar al máximo tu experiencia de aprendizaje
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PARTICIPANT_TUTORIALS.map((tutorial) => (
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
