import axios from 'axios'

// Si no se define VITE_API_BASE_URL, por defecto usamos "/api" en el mismo dominio (Hostinger)
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({ baseURL, timeout: 10000 })

export type ContactPayload = {
  nombre: string
  edad: string
  nacionalidad: string
  email: string
  telefono: string
  idioma: string
  modalidad: string
  franja: string
}

export async function sendContactForm(payload: ContactPayload) {
  return api.post('/contact.php', payload)
}

// Auth
export async function login(username: string, password: string) {
  return api.post('/auth/login.php', { username, password })
}

export async function logout() {
  return api.post('/auth/logout.php')
}

export type SessionUser = { id: number; username: string; name: string; role: string } | null
export async function me(): Promise<SessionUser> {
  const res = await api.get('/auth/me.php')
  return res.data?.user ?? null
}

// Student progress (protected)
export type StudentProgress = {
  asistencia: number
  notas: { actividad: string; nota: number; fecha: string }[]
  nivel: { mcer: string; descripcion: string }
  fortalezas: string[]
  debilidades: string[]
}
export async function getStudentProgress(): Promise<StudentProgress> {
  const res = await api.get('/student/progreso.php')
  return res.data?.progreso
}

// Scheduling
export type ScheduleSlot = { datetime: string; tipo: string; modalidad: string }
export type Reservation = { id: number; datetime: string; tipo: string; modalidad: string; notas?: string; created_at: string }

export async function getScheduleSlots(): Promise<ScheduleSlot[]> {
  const res = await api.get('/schedule/slots.php')
  return res.data?.slots ?? []
}

export async function getMyReservations(): Promise<Reservation[]> {
  const res = await api.get('/schedule/my.php')
  return res.data?.reservas ?? []
}

export async function createReservation(input: { datetime: string; tipo: string; modalidad: string; notas?: string }) {
  return api.post('/schedule/reserve.php', input)
}

export async function cancelReservation(id: number) {
  return api.post('/schedule/cancel.php', { id })
}

// Admin: users
export async function createUser(input: { username: string; password: string; name?: string; role?: 'student' | 'admin' | 'teacher' }) {
  return api.post('/auth/create_user.php', input)
}

export async function disableDemoUser() {
  return api.post('/auth/disable_demo.php')
}

export type AdminUser = { id: number; username: string; name: string | null; role: string; created_at: string }
export async function listUsers(params: { q?: string; page?: number; limit?: number } = {}): Promise<{ items: AdminUser[]; total: number; page: number; limit: number }> {
  const res = await api.get('/admin/users.php', { params })
  return res.data
}

export async function resetUserPassword(input: { id?: number; username?: string; password: string }) {
  return api.post('/admin/reset_password.php', input)
}

export const EXPORT_CONTACTS_URL = '/admin/contacts_export.php'
export const EXPORT_RESERVATIONS_URL = '/admin/reservations_export.php'

// Admin: assign student to teacher
export async function assignStudent(input: { student_username: string; teacher_username: string; level?: string; modality?: 'virtual' | 'presencial' }) {
  return api.post('/admin/assign_student.php', input)
}

// Teacher: list students grouped
export type TeacherGroupedStudents = Record<string, { virtual: any[]; presencial: any[]; ['sin-definir']: any[] }>
export async function getTeacherStudents(): Promise<TeacherGroupedStudents> {
  const res = await api.get('/teacher/students.php')
  return res.data?.students ?? {}
}
