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

const ADMIN_TUTORIALS: TutorialSection[] = [
  {
    id: "dashboard",
    title: "Dashboard Administrativo",
    description: "Aprende a usar tu dashboard principal",
    icon: <BarChart3 className="w-6 h-6" />,
    steps: [
      {
        title: "Visualización General",
        description: "El dashboard muestra estadísticas clave de tu plataforma educativa",
        details: [
          "Total de usuarios registrados en el sistema",
          "Desglose por roles: administradores, docentes y participantes",
          "Cantidad de cursos activos disponibles",
          "Número total de inscripciones realizadas",
        ],
      },
      {
        title: "Gráficos y Estadísticas",
        description: "Visualiza datos en tiempo real con gráficos interactivos",
        details: [
          "Gráfico de barras: Cursos e inscritos por categoría",
          "Gráfico de pastel: Distribución de roles en la plataforma",
          "Información actualizada automáticamente cada 2 segundos",
          "Haz clic en los elementos para ver más detalles",
        ],
      },
      {
        title: "Resumen General",
        description: "Revisa métricas importantes en una vista consolidada",
        details: [
          "Total de inscripciones en todos los cursos",
          "Promedio de estudiantes por curso",
          "Tasa de adopción de la plataforma",
          "Identifica tendencias y oportunidades de mejora",
        ],
      },
      {
        title: "Acciones Recomendadas",
        description: "Mantén tu plataforma en óptimas condiciones",
        details: [
          "Monitorea regularmente las estadísticas",
          "Identifica cursos con bajo número de inscritos",
          "Gestiona usuarios desde la sección de usuarios",
          "Ajusta la configuración según necesidades",
        ],
      },
    ],
  },
  {
    id: "users",
    title: "Gestión de Usuarios",
    description: "Administra todos los usuarios del sistema",
    icon: <Users className="w-6 h-6" />,
    steps: [
      {
        title: "Ver Usuarios",
        description: "Accede a la lista completa de usuarios registrados",
        details: [
          "Visualiza todos los usuarios del sistema en una tabla",
          "Ve información de cada usuario: nombre, email, rol, fecha de registro",
          "Los datos se actualizan en tiempo real",
          "Utiliza búsqueda para encontrar usuarios específicos",
        ],
      },
      {
        title: "Filtrar por Rol",
        description: "Organiza usuarios según su rol en el sistema",
        details: [
          "Filtra para ver solo administradores",
          "Visualiza docentes que crean cursos",
          "Revisa participantes inscritos en cursos",
          "Combina filtros para búsquedas más específicas",
        ],
      },
      {
        title: "Acciones sobre Usuarios",
        description: "Realiza cambios y gestiona usuarios",
        details: [
          "Edita información de perfil de usuarios",
          "Cambia roles de usuarios según necesites",
          "Desactiva o elimina cuentas si es necesario",
          "Registra cambios importantes en auditoría",
        ],
      },
      {
        title: "Mejores Prácticas",
        description: "Administra usuarios de forma efectiva",
        details: [
          "Revisa regularmente usuarios nuevos",
          "Mantén roles actualizados según responsabilidades",
          "Resuelve problemas de acceso rápidamente",
          "Documenta cambios importantes realizados",
        ],
      },
    ],
  },
  {
    id: "courses",
    title: "Gestión de Cursos",
    description: "Supervisa todos los cursos de la plataforma",
    icon: <BookOpen className="w-6 h-6" />,
    steps: [
      {
        title: "Vista de Cursos",
        description: "Accede al listado completo de cursos",
        details: [
          "Ve todos los cursos creados en la plataforma",
          "Información de cada curso: título, docente, categoría, estudiantes",
          "Estado de cada curso: activo, pausado o archivado",
          "Datos de inscripciones y progreso de estudiantes",
        ],
      },
      {
        title: "Filtrado y Búsqueda",
        description: "Encuentra cursos específicos rápidamente",
        details: [
          "Busca por nombre de curso",
          "Filtra por docente responsable",
          "Organiza por categoría de curso",
          "Ordena por fecha de creación o número de inscritos",
        ],
      },
      {
        title: "Supervisión de Cursos",
        description: "Monitorea la calidad y actividad de cursos",
        details: [
          "Verifica contenido y estructura de cursos",
          "Revisa el desempeño y satisfacción de estudiantes",
          "Asegura que los cursos cumplan estándares de calidad",
          "Contacta docentes para mejoras si es necesario",
        ],
      },
      {
        title: "Acciones Administrativas",
        description: "Gestiona cursos según necesidades",
        details: [
          "Activa o desactiva cursos",
          "Asigna docentes a cursos",
          "Modifica categorías de clasificación",
          "Resuelve conflictos de inscripción",
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

export default function AdminTutorialPage() {
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialSection | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleStartTutorial = (tutorial: TutorialSection) => {
    setSelectedTutorial(tutorial)
    setIsModalOpen(true)
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Tutorial del Administrador</h1>
            <p className="text-lg text-slate-600">
              Aprende a usar todas las funciones de administración de la plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ADMIN_TUTORIALS.map((tutorial) => (
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
