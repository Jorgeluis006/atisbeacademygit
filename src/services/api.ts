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
