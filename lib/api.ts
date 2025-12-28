// API client para conectar con JSON Server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}

export const api = {
  // Users
  getUsers: () => fetchAPI("/users"),
  getUserById: (id: number) => fetchAPI(`/users/${id}`),
  createUser: (data: any) => fetchAPI("/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id: number, data: any) => fetchAPI(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: number) => fetchAPI(`/users/${id}`, { method: "DELETE" }),

  // Courses
  getCourses: () => fetchAPI("/courses"),
  getCourseById: (id: number) => fetchAPI(`/courses/${id}`),
  createCourse: (data: any) => fetchAPI("/courses", { method: "POST", body: JSON.stringify(data) }),
  updateCourse: (id: number, data: any) => fetchAPI(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCourse: (id: number) => fetchAPI(`/courses/${id}`, { method: "DELETE" }),

  // Enrollments
  getEnrollments: () => fetchAPI("/enrollments"),
  createEnrollment: (data: any) => fetchAPI("/enrollments", { method: "POST", body: JSON.stringify(data) }),
  updateEnrollment: (id: number, data: any) =>
    fetchAPI(`/enrollments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteEnrollment: (id: number) => fetchAPI(`/enrollments/${id}`, { method: "DELETE" }),
  getEnrollmentById: (id: number) => fetchAPI(`/enrollments/${id}`),

  // Activities
  getActivities: (courseId?: number) => {
    const query = courseId ? `?courseId=${courseId}` : ""
    return fetchAPI(`/activities${query}`)
  },
  createActivity: (data: any) => fetchAPI("/activities", { method: "POST", body: JSON.stringify(data) }),
  updateActivity: (id: number, data: any) =>
    fetchAPI(`/activities/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteActivity: (id: number) => fetchAPI(`/activities/${id}`, { method: "DELETE" }),

  // Submissions
  getSubmissions: (activityId?: number) => {
    const query = activityId ? `?activityId=${activityId}` : ""
    return fetchAPI(`/submissions${query}`)
  },
  createSubmission: (data: any) => fetchAPI("/submissions", { method: "POST", body: JSON.stringify(data) }),
  updateSubmission: (id: number, data: any) =>
    fetchAPI(`/submissions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSubmission: (id: number) => fetchAPI(`/submissions/${id}`, { method: "DELETE" }),

  recordVideoView: (enrollmentId: number) =>
    fetchAPI(`/enrollments/${enrollmentId}`, {
      method: "PATCH",
      body: JSON.stringify({ videoWatched: true }),
    }),

  recordFileAccess: async (enrollmentId: number) => {
    const enrollment = await fetchAPI(`/enrollments/${enrollmentId}`)
    return fetchAPI(`/enrollments/${enrollmentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        filesAccessedCount: (enrollment?.filesAccessedCount || 0) + 1,
      }),
    })
  },
}
