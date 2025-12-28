export interface ProgressComponents {
  videoWatched: boolean
  filesAccessed: number // number of files accessed
  activitiesCompleted: number // number of activities completed
  totalFiles: number
  totalActivities: number
}

/**
 * Calcula el progreso del participante basado en:
 * - Video: 30% si hay actividades, 50% si no hay
 * - Archivos: 30% si hay actividades, 50% si no hay (dividido entre cantidad de archivos)
 * - Actividades: 40% (dividido entre cantidad de actividades)
 */
export function calculateProgress(components: ProgressComponents): number {
  const { videoWatched, filesAccessed, activitiesCompleted, totalFiles, totalActivities } = components

  // Si no hay actividades, distribuir 50-50 entre video y archivos
  if (totalActivities === 0) {
    let progress = 0

    // 50% por ver el video
    if (videoWatched) {
      progress += 50
    }

    // 50% por archivos (dividido entre cantidad de archivos)
    if (totalFiles > 0) {
      const filesPercentage = (filesAccessed / totalFiles) * 50
      progress += filesPercentage
    }

    return Math.min(100, Math.round(progress))
  }

  // Si hay actividades, distribuir 30-30-40
  let progress = 0

  // 30% por ver el video
  if (videoWatched) {
    progress += 30
  }

  // 30% por archivos (dividido entre cantidad de archivos)
  if (totalFiles > 0) {
    const filesPercentage = (filesAccessed / totalFiles) * 30
    progress += filesPercentage
  }

  // 40% por actividades (dividido entre cantidad de actividades)
  if (totalActivities > 0) {
    const activitiesPercentage = (activitiesCompleted / totalActivities) * 40
    progress += activitiesPercentage
  }

  return Math.min(100, Math.round(progress))
}

/**
 * Calcula los componentes de progreso basados en datos del participante
 */
export function getProgressComponents(
  enrollments: any[],
  courseId: number,
  userId: number | undefined,
  submissions: any[],
  totalFiles: number,
  totalActivities: number,
  videoWatched: boolean,
): ProgressComponents {
  const enrollment = enrollments.find((e: any) => e.courseId === courseId && e.userId === userId)

  // Contar actividades completadas del usuario en este curso
  const activitiesCompleted = submissions.filter((s: any) =>
    s.userId === userId && !s.courseId ? true : s.courseId === courseId,
  ).length

  // Contar archivos accedidos (por ahora asumimos que si el usuario vio la página, accedió a los archivos)
  const filesAccessed = enrollment?.filesAccessedCount || 0

  return {
    videoWatched,
    filesAccessed,
    activitiesCompleted,
    totalFiles,
    totalActivities,
  }
}
