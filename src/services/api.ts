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
export async function login(username: string, email: string, password: string) {
  return api.post('/auth/login.php', { username, email, password })
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
  curso?: string
}
export async function getStudentProgress(): Promise<StudentProgress> {
  const res = await api.get('/student/progreso.php')
  return res.data?.progreso
}

// Teacher: progress management
export async function getStudentProgressFor(studentUsername: string): Promise<{ student: { id: number; username: string; name: string|null }, progreso: StudentProgress }> {
  const res = await api.get('/teacher/student_progress.php', { params: { student: studentUsername } })
  return res.data
}

export async function saveStudentProgress(input: { student_username: string; progreso: StudentProgress }) {
  return api.post('/teacher/save_progress.php', input)
}

// Scheduling
export type ScheduleSlot = { 
  id?: number; 
  datetime: string; 
  tipo: string; 
  modalidad: string; 
  duration_minutes?: number;
  curso?: string;
  nivel?: string;
  meeting_link?: string;
  max_alumnos?: number;
}
export type Reservation = { 
  id: number; 
  datetime: string; 
  tipo: string; 
  modalidad: string; 
  notas?: string; 
  created_at: string; 
  student_id?: number; 
  student_name?: string; 
  student_username?: string;
  curso?: string;
  nivel?: string;
  meeting_link?: string;
}

export async function getScheduleSlots(): Promise<ScheduleSlot[]> {
  const res = await api.get('/schedule/slots.php')
  return res.data?.slots ?? []
}

export async function getMyReservations(): Promise<Reservation[]> {
  const res = await api.get('/schedule/my.php')
  return res.data?.reservas ?? []
}

export async function createReservation(input: { datetime: string; tipo: string; modalidad: string; notas?: string; slot_id?: number }) {
  return api.post('/schedule/reserve.php', input)
}

export async function cancelReservation(id: number) {
  return api.post('/schedule/cancel.php', { id })
}

// Admin: users
export async function createUser(input: { username: string; password: string; name?: string; role?: 'student' | 'admin' | 'teacher'; email?: string }) {
  return api.post('/auth/create_user.php', input)
}

export async function disableDemoUser() {
  return api.post('/auth/disable_demo.php')
}

export type AdminUser = { id: number; username: string; name: string | null; role: string; created_at: string; email: string | null }
export async function listUsers(params: { q?: string; page?: number; limit?: number } = {}): Promise<{ items: AdminUser[]; total: number; page: number; limit: number }> {
  const res = await api.get('/admin/users.php', { params })
  return res.data
}

export async function resetUserPassword(input: { id?: number; username?: string; password: string }) {
  return api.post('/admin/reset_password.php', input)
}

export async function deleteUser(id: number) {
  return api.post('/admin/delete_user.php', { id })
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

// Teacher: manage slots
export async function getTeacherSlots(): Promise<ScheduleSlot[]> {
  const res = await api.get('/teacher/slots.php')
  return res.data?.slots ?? []
}

export async function createTeacherSlot(input: { datetime: string; tipo: string; modalidad: string; duration_minutes?: number; curso?: string; nivel?: string; meeting_link?: string; max_alumnos?: number }) {
  return api.post('/teacher/slots.php', input)
}

export async function updateTeacherSlotMeetingLink(id: number, meeting_link: string) {
  return api.put('/teacher/slots.php', { id, meeting_link })
}

export async function deleteTeacherSlot(id: number) {
  return api.delete('/teacher/slots.php', { data: { id } })
}

// Teacher: view student reservations
export async function getTeacherReservations(): Promise<Reservation[]> {
  const res = await api.get('/teacher/reservations.php')
  return res.data?.reservations ?? []
}

// Admin: booking settings (días permitidos)
export async function getBookingSettings(teacherId?: number): Promise<{ blocked_days?: string[] | null; allowed_days?: string[] | null }> {
  const params = teacherId ? { params: { teacher_id: teacherId } } : undefined
  const res = await api.get('/admin/booking_settings.php', params)
  // server returns blocked_days; provide allowed_days for backwards compatibility
  const blocked: string[] | null = res.data?.blocked_days ?? null
  const all = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const allowed = blocked ? all.filter(d => !blocked.includes(d)) : null
  return { blocked_days: blocked, allowed_days: allowed }
}

export async function saveBookingSettings(input: { blocked_days?: string[]; allowed_days?: string[]; teacher_id?: number }) {
  // API expects blocked_days; accept allowed_days from UI and convert
  let blocked = input.blocked_days ?? null
  if (!blocked && Array.isArray(input.allowed_days)) {
    const all = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    blocked = all.filter(d => !input.allowed_days!.includes(d))
  }
  const payload: any = { blocked_days: blocked ?? [] }
  // teacher_id is ignored by server now, but keep for backward compatibility
  if (input.teacher_id) payload.teacher_id = input.teacher_id
  const res = await api.post('/admin/booking_settings.php', payload)
  return res.data
}

// CMS: Testimonials
export type Testimonial = {
  id?: number
  author_name: string
  author_role?: string
  content: string
  rating?: number
  image_url?: string
  is_published?: boolean
  display_order?: number
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await api.get('/public/testimonials.php')
  return res.data?.items ?? []
}

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  const res = await api.get('/admin/testimonials.php')
  return res.data?.items ?? []
}

export async function createTestimonial(input: Testimonial) {
  return api.post('/admin/testimonials.php', input)
}

export async function updateTestimonial(input: Testimonial) {
  return api.put('/admin/testimonials.php', input)
}

export async function deleteTestimonial(id: number) {
  return api.delete('/admin/testimonials.php', { data: { id } })
}

// CMS: Courses
export type Course = {
  id?: number
  title: string
  description: string
  price?: number
  duration?: string
  level?: string
  modality?: string
  course_type?: string
  image_url?: string
  syllabus?: string
  is_published?: boolean
  display_order?: number
}

export async function getCourses(): Promise<Course[]> {
  const res = await api.get('/public/courses.php')
  return res.data?.items ?? []
}

export async function getAdminCourses(): Promise<Course[]> {
  const res = await api.get('/admin/courses.php')
  return res.data?.items ?? []
}

export async function createCourse(input: Course) {
  return api.post('/admin/courses.php', input)
}

export async function updateCourse(input: Course) {
  return api.put('/admin/courses.php', input)
}

export async function deleteCourse(id: number) {
  return api.delete('/admin/courses.php', { data: { id } })
}

// CMS: Blog
export type BlogPost = {
  id?: number
  title: string
  slug?: string
  excerpt?: string
  content: string
  author_id?: number
  author_name?: string
  author_username?: string
  image_url?: string
  category?: string
  tags?: string
  is_published?: boolean
  published_at?: string
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await api.get('/public/blog.php')
  return res.data?.items ?? []
}

export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  const res = await api.get('/admin/blog.php')
  return res.data?.items ?? []
}

export async function createBlogPost(input: BlogPost) {
  return api.post('/admin/blog.php', input)
}

export async function updateBlogPost(input: BlogPost) {
  return api.put('/admin/blog.php', input)
}

export async function deleteBlogPost(id: number) {
  return api.delete('/admin/blog.php', { data: { id } })
}

// CMS: Videos
export type Video = {
  id?: number
  title?: string
  video_url: string
  thumbnail_url?: string
  is_published?: boolean
  display_order?: number
}

export async function getVideos(): Promise<Video[]> {
  const res = await api.get('/public/videos.php')
  return res.data?.items ?? []
}

export async function getAdminVideos(): Promise<Video[]> {
  const res = await api.get('/admin/videos.php')
  return res.data?.items ?? []
}

export async function createVideo(input: Video) {
  return api.post('/admin/videos.php', input)
}

export async function updateVideo(input: Video) {
  return api.put('/admin/videos.php', input)
}

export async function deleteVideo(id: number) {
  return api.delete('/admin/videos.php', { data: { id } })
}

// Public: Teachers list
export type TeacherPublic = { id: number; username: string; name: string | null; email: string | null }
export async function getPublicTeachers(): Promise<TeacherPublic[]> {
  const res = await api.get('/public/teachers.php')
  return res.data?.items ?? []
}

// Upload image
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const res = await api.post('/upload_image.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data?.url
}

// Upload video
export async function uploadVideo(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('video', file)
  const res = await api.post('/upload_video.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000 // 5 minutos para videos grandes
  })
  return res.data?.url
}

// Password management
export async function changePassword(currentPassword: string, newPassword: string) {
  return api.post('/auth/change_password.php', { 
    current_password: currentPassword, 
    new_password: newPassword 
  })
}

export async function forgotPassword(email: string) {
  return api.post('/auth/forgot_password.php', { email })
}

export async function resetPassword(token: string, newPassword: string) {
  return api.post('/auth/reset_password.php', { 
    token, 
    new_password: newPassword 
  })
}

// Chat
export type ChatMessage = {
  id: number
  sender_id: number
  receiver_id: number
  body: string
  reservation_id?: number | null
  created_at: string
}

export async function getChatMessages(otherId: number, options: { limit?: number; before_id?: number } = {}): Promise<ChatMessage[]> {
  const res = await api.get('/chat/list.php', { params: { other_id: otherId, ...options } })
  return res.data?.messages ?? []
}

export async function sendChatMessage(receiverId: number, body: string, reservationId?: number): Promise<{ id: number }> {
  const res = await api.post('/chat/send.php', { receiver_id: receiverId, body, reservation_id: reservationId })
  return res.data
}
