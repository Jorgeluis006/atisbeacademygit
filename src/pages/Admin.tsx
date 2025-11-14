import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  me, 
  createUser, 
  listUsers, 
  type AdminUser, 
  resetUserPassword,
  deleteUser, 
  assignStudent, 
  logout as apiLogout,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
  getAdminCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type Course,
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogPost,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  changePassword,
  getBookingSettings,
  saveBookingSettings,
  type Video,
  uploadImage,
  uploadVideo
} from '../services/api'

import AdminContacts from './AdminContacts'



function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }
    
    setLoading(true)
    
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">¡Contraseña actualizada!</h3>
          <p className="text-gray-600">Tu contraseña ha sido cambiada exitosamente.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Cambiar contraseña</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña actual
          </label>
          <div className="relative mb-4">
            <input 
              type={showCurrent ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              placeholder="••••••••" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrent ? '🙈' : '👁️'}
            </button>
          </div>
          
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nueva contraseña
          </label>
          <div className="relative mb-4">
            <input 
              type={showNew ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              placeholder="••••••••" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNew ? '🙈' : '👁️'}
            </button>
          </div>
          
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirmar nueva contraseña
          </label>
          <div className="relative mb-6">
            <input 
              type={showConfirm ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<{ username: string; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [activeTab, setActiveTab] = useState<'contacts' | 'users' | 'testimonials' | 'courses' | 'blog' | 'videos' | 'products' | 'config'>('users')
  const [showChangePassword, setShowChangePassword] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const u = await me()
        if (u && u.role === 'admin') setAuth({ username: u.username, name: u.name, role: u.role })
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <main className="container-padded py-12"><p>Cargando…</p></main>
  if (!auth) return (
    <main className="bg-brand-cream">
      <div className="bg-brand-purple py-12">
        <div className="container-padded">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
            Panel de administración
          </h1>
          <p className="text-white/90 text-center mt-3 text-lg">
            Administra usuarios, contenido y configuración
          </p>
        </div>
      </div>
      <div className="container-padded py-12">
        <p className="text-center text-brand-black/70">No autorizado. Inicia sesión con una cuenta admin.</p>
      </div>
    </main>
  )

  return (
    <main className="bg-brand-cream">
      {/* Header con título */}
      <div className="bg-brand-purple py-12">
        <div className="container-padded">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
            Panel de administración
          </h1>
          <p className="text-white/90 text-center mt-3 text-lg">
            Administra usuarios, contenido y configuración
          </p>
        </div>
      </div>

      <div className="container-padded py-12">
        <div className="flex items-center justify-end gap-4 mb-6">
          <button 
            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 font-semibold flex items-center gap-2"
            onClick={() => setShowChangePassword(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Cambiar contraseña
          </button>
          <button className="btn-secondary" onClick={async () => { try { await apiLogout() } finally { navigate('/', { replace: true }) } }}>Salir</button>
        </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-black/10 mb-6">
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'contacts' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('contacts')}
        >
          Contactos
        </button>
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'users' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('users')}
        >
          Usuarios
        </button>
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'testimonials' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('testimonials')}
        >
          Testimonios
        </button>
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'courses' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('courses')}
        >
          Cursos
        </button>
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'blog' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('blog')}
        >
          Blog
        </button>
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'videos' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
        </button>
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'products' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('products')}
        >
          Productos
        </button>
        <button 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'config' ? 'border-b-2 border-brand-purple text-brand-purple' : 'text-brand-black/60 hover:text-brand-black'}`}
          onClick={() => setActiveTab('config')}
        >
          Configuración
        </button>
      </div>

  {/* Tab Content */}
  {activeTab === 'contacts' && <AdminContacts />}
  {activeTab === 'users' && (
        <>
          <section className="rounded-xl shadow-lg p-8 mt-6 max-w-xl bg-gradient-to-br from-brand-mauve/20 via-brand-cream to-brand-purple/10 border border-brand-mauve/30">
            <h2 className="section-title text-brand-purple">Crear usuario</h2>
            <CreateUserForm onDone={(m) => { setMsg(m); setErr('') }} onError={(e) => { setErr(e); setMsg('') }} />
          </section>

          <section className="rounded-xl shadow-lg p-8 mt-6 max-w-2xl bg-gradient-to-br from-brand-purple/10 via-brand-cream to-brand-mauve/20 border border-brand-purple/30">
            <h2 className="section-title text-brand-purple">Asignar estudiante a profesor</h2>
            <AssignStudentForm onDone={(m) => { setMsg(m); setErr('') }} onError={(e) => { setErr(e); setMsg('') }} />
          </section>

          <UsersList />
        </>
      )}

      {activeTab === 'testimonials' && <TestimonialsManager />}
      {activeTab === 'courses' && <CoursesManager />}
      {activeTab === 'blog' && <BlogManager />}
      {activeTab === 'videos' && <VideosManager />}
      {activeTab === 'products' && <ProductsManager />}
      {activeTab === 'config' && <BookingSettingsManager />}

      {(msg || err) && (
        <div className="mt-4">
          {msg && <p className="text-brand-purple font-semibold">{msg}</p>}
          {err && <p className="text-brand-orange font-semibold">{err}</p>}
        </div>
      )}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      </div>
    </main>
  )
}

function CreateUserForm({ onDone, onError }: { onDone: (msg: string) => void; onError: (err: string) => void }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'admin' | 'teacher'>('student')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) { onError('Usuario y contraseña son requeridos'); return }
    if (!email) { onError('El correo electrónico es requerido'); return }
    setLoading(true)
    try {
      await createUser({ username, password, name, role, email })
      setUsername(''); setEmail(''); setPassword(''); setName(''); setRole('student')
      onDone('Usuario creado correctamente')
    } catch (e: any) {
      if (e?.response?.status === 409) onError('El usuario ya existe')
      else onError('No se pudo crear el usuario')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="label">Usuario</label>
      <input className="input-control" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} />
      <label className="label">Correo electrónico</label>
      <input className="input-control" type="email" placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
      <label className="label">Nombre (opcional)</label>
      <input className="input-control" placeholder="Nombre (opcional)" value={name} onChange={e => setName(e.target.value)} />
      <label className="label">Contraseña</label>
      <input className="input-control" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      <label className="label">Rol</label>
      <select className="select-control max-w-xs" value={role} onChange={e => setRole(e.target.value as any)}>
        <option value="student">Estudiante</option>
        <option value="admin">Admin</option>
        <option value="teacher">Profesor</option>
      </select>
      <div>
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creando…' : 'Crear'}</button>
      </div>
    </form>
  )
}

function AssignStudentForm({ onDone, onError }: { onDone: (msg: string) => void; onError: (err: string) => void }) {
  const [students, setStudents] = useState<AdminUser[]>([])
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [student, setStudent] = useState('')
  const [teacher, setTeacher] = useState('')
  const [level, setLevel] = useState('')
  const [modality, setModality] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Cargar todos los usuarios y filtrar por rol
    (async () => {
      try {
        let page = 1
        const limit = 50
        let total = 0
        let acc: AdminUser[] = []
        do {
          const res = await listUsers({ page, limit })
          acc = acc.concat(res.items)
          total = res.total
          page += 1
        } while (acc.length < total)
        setStudents(acc.filter(u => u.role === 'student'))
        setTeachers(acc.filter(u => u.role === 'teacher'))
      } catch (e) {
        // Ignorar
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!student || !teacher) { onError('Selecciona estudiante y profesor'); return }
    setSubmitting(true)
    try {
      await assignStudent({ student_username: student, teacher_username: teacher, level: level || undefined, modality: (modality as any) || undefined })
      setStudent(''); setTeacher(''); setLevel(''); setModality('')
      onDone('Asignación guardada')
    } catch (e) {
      onError('No se pudo asignar')
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {loading ? <p>Cargando usuarios…</p> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Estudiante</label>
              <select className="select-control" value={student} onChange={e => setStudent(e.target.value)}>
                <option value="">Selecciona estudiante…</option>
                {students.map(s => (
                  <option key={s.id} value={s.username}>{s.username}{s.name ? ` — ${s.name}` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Profesor</label>
              <select className="select-control" value={teacher} onChange={e => setTeacher(e.target.value)}>
                <option value="">Selecciona profesor…</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.username}>{t.username}{t.name ? ` — ${t.name}` : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Nivel (opcional)</label>
              <select className="select-control" value={level} onChange={e => setLevel(e.target.value)}>
                <option value="">Sin definir</option>
                {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Modalidad (opcional)</label>
              <select className="select-control" value={modality} onChange={e => setModality(e.target.value)}>
                <option value="">Sin definir</option>
                <option value="virtual">Virtual</option>
                <option value="presencial">Presencial</option>
              </select>
            </div>
          </div>
          <div>
            <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Guardando…' : 'Guardar asignación'}</button>
          </div>
        </>
      )}
    </form>
  )
}

function BookingSettingsManager() {
  const [allowed, setAllowed] = useState<string[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [teachers, setTeachers] = useState<AdminUser[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<number | 'global'>('global')
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  useEffect(() => {
    (async () => {
      try {
        // cargar lista de usuarios y filtrar profesores
        const u = await listUsers({ limit: 1000 })
        setTeachers(u.items.filter(it => it.role === 'teacher'))
      } catch (e) {
        setTeachers([])
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        if (selectedTeacher === 'global') {
          const res = await getBookingSettings()
          setAllowed(res.allowed_days ?? [])
        } else {
          const res = await getBookingSettings(selectedTeacher as number)
          setAllowed(res.allowed_days ?? [])
        }
      } catch (e) {
        setAllowed([])
      }
    })()
  }, [selectedTeacher])

  function toggleDay(day: string) {
    setAllowed((prev) => {
      const cur = prev ?? []
      if (cur.includes(day)) return cur.filter(d => d !== day)
      return [...cur, day]
    })
  }

  async function save() {
    setSaving(true)
    try {
      if (selectedTeacher === 'global') {
        await saveBookingSettings({ allowed_days: allowed ?? [] })
      } else {
        await saveBookingSettings({ allowed_days: allowed ?? [], teacher_id: selectedTeacher as number })
      }
      alert('Guardado')
    } catch (e) {
      alert('Error guardando')
    } finally { setSaving(false) }
  }

  return (
    <section className="rounded-xl shadow-lg p-8 mt-6 bg-white">
      <h2 className="section-title text-brand-purple">Configuración de reservas</h2>
      <p className="text-sm text-gray-600 mb-4">Por defecto todos los días están disponibles. Marca los días que deseas <strong>bloquear</strong> (no podrán recibir reservas) para el alcance seleccionado.</p>

      <div className="mb-4">
        <label className="label">Seleccionar alcance</label>
        <select className="select-control max-w-sm" value={selectedTeacher as any} onChange={(e) => setSelectedTeacher(e.target.value === 'global' ? 'global' : Number(e.target.value))}>
          <option value="global">Global (todos los profesores)</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name || t.username}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {days.map(d => (
          <button key={d} type="button" onClick={() => toggleDay(d)} className={`px-4 py-2 rounded-full border ${ (allowed ?? []).includes(d) ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border-gray-200' }`}>
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
    </section>
  )
}

function UsersList() {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [items, setItems] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const pages = Math.max(1, Math.ceil(total / limit))

  async function load() {
    setLoading(true)
    try {
      const res = await listUsers({ q, page, limit })
      setItems(res.items); setTotal(res.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [q, page])

  async function doReset(u: AdminUser) {
    const pwd = window.prompt(`Nueva contraseña para ${u.username}`)
    if (!pwd) return
    try { await resetUserPassword({ id: u.id, password: pwd }); alert('Contraseña actualizada') }
    catch { alert('No se pudo actualizar') }
  }

  async function doDelete(u: AdminUser) {
    const isAdmin = u.role === 'admin'
    const confirmMessage = isAdmin 
      ? `⚠️ ADVERTENCIA: Estás a punto de eliminar una cuenta de ADMINISTRADOR.\n\nUsuario: "${u.username}"\n\n¿Estás COMPLETAMENTE seguro?\n\nEsta acción no se puede deshacer.`
      : `¿Estás seguro de eliminar el usuario "${u.username}"?\n\nEsta acción no se puede deshacer.`
    
    if (!confirm(confirmMessage)) return
    
    try {
      await deleteUser(u.id)
      alert('Usuario eliminado correctamente')
      load() // Recargar la lista
    } catch (e: any) {
      alert(e?.response?.data?.message || 'No se pudo eliminar el usuario')
    }
  }

  return (
    <section className="rounded-xl shadow-lg p-8 mt-6 bg-gradient-to-br from-brand-orange/10 via-brand-cream to-brand-yellow/10 border border-brand-orange/30">
      <h2 className="section-title text-brand-purple mb-6">Usuarios</h2>
      <div className="flex gap-3 items-center mb-6 flex-wrap">
        <input 
          className="input-control w-full max-w-sm border-brand-mauve/50 focus:border-brand-purple focus:ring-brand-purple/20" 
          placeholder="Buscar por usuario o nombre" 
          value={q} 
          onChange={e => { setPage(1); setQ(e.target.value) }} 
        />
        <button className="btn-secondary bg-brand-purple hover:bg-brand-purple/90 text-white" onClick={load}>Buscar</button>
      </div>
      {loading ? <p className="text-brand-purple">Cargando…</p> : (
        <div className="overflow-auto">
          <table className="table-clean">
            <thead>
              <tr className="bg-brand-purple/10">
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.name || '-'}</td>
                  <td className="text-sm">{u.email || <span className="text-brand-mauve/60 italic">Sin correo</span>}</td>
                  <td>
                    {u.role === 'admin' && <span className="badge-role-admin">Admin</span>}
                    {u.role === 'teacher' && <span className="badge-role-teacher">Profesor</span>}
                    {u.role === 'student' && <span className="badge-role-student">Estudiante</span>}
                  </td>
                  <td>{new Date(u.created_at).toLocaleString()}</td>
                  <td className="space-x-2">
                    <button className="btn-ghost underline" onClick={() => doReset(u)}>Resetear contraseña</button>
                    <button 
                      className={`btn-ghost underline ${u.role === 'admin' ? 'text-brand-orange hover:text-brand-orange/80' : 'text-brand-orange hover:text-brand-orange/80'}`} 
                      onClick={() => doDelete(u)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-3 mt-3">
        <button className="btn-secondary" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Anterior</button>
        <span className="text-sm text-brand-black/70">Página {page} de {pages}</span>
        <button className="btn-secondary" disabled={page>=pages} onClick={() => setPage(p => Math.min(pages, p+1))}>Siguiente</button>
      </div>
    </section>
  )
}

// CMS: Testimonials Manager
function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminTestimonials()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setEditing({ ...editing, image_url: url })
      alert('Imagen subida exitosamente')
    } catch (err) {
      alert('Error al subir la imagen')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(item: Testimonial) {
    try {
      if (item.id) {
        await updateTestimonial(item)
      } else {
        await createTestimonial(item)
      }
      setEditing(null)
      await load()
      alert('Guardado exitosamente')
    } catch {
      alert('Error al guardar')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este testimonio?')) return
    try {
      await deleteTestimonial(id)
      await load()
    } catch {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="rounded-xl shadow-lg p-8 bg-gradient-to-br from-brand-mauve/20 via-brand-cream to-brand-purple/10 border border-brand-mauve/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title text-brand-purple">Testimonios</h2>
        <button className="btn-primary bg-brand-purple hover:bg-brand-purple/90 text-white" onClick={() => setEditing({ author_name: '', content: '', rating: 5, is_published: true, display_order: 0 })}>
          Nuevo testimonio
        </button>
      </div>

      {editing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-brand-purple/20">
          <h3 className="font-serif text-lg mb-4 text-brand-purple">{editing.id ? 'Editar' : 'Nuevo'} Testimonio</h3>
          <div className="grid gap-4">
            <div>
              <label className="label">Nombre del autor</label>
              <input className="input-control" value={editing.author_name} onChange={e => setEditing({ ...editing, author_name: e.target.value })} />
            </div>
            <div>
              <label className="label">Rol / Título (opcional)</label>
              <input className="input-control" value={editing.author_role || ''} onChange={e => setEditing({ ...editing, author_role: e.target.value })} />
            </div>
            <div>
              <label className="label">Contenido</label>
              <textarea className="input-control" rows={4} value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Rating (1-5)</label>
                <input className="input-control" type="number" min={1} max={5} value={editing.rating || 5} onChange={e => setEditing({ ...editing, rating: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Orden</label>
                <input className="input-control" type="number" value={editing.display_order || 0} onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.is_published !== false} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />
                  <span className="text-sm">Publicado</span>
                </label>
              </div>
            </div>
            <div>
              <label className="label">Imagen del autor</label>
              <div className="grid gap-2">
                <input 
                  className="input-control" 
                  placeholder="URL de la imagen (opcional)" 
                  value={editing.image_url || ''} 
                  onChange={e => setEditing({ ...editing, image_url: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-black/60">o subir:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <span className="text-sm text-brand-purple">Subiendo...</span>}
                </div>
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-full mt-2" />
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => handleSave(editing)}>Guardar</button>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div className="overflow-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Autor</th>
                <th>Contenido</th>
                <th>Rating</th>
                <th>Estado</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="font-semibold">{item.author_name}</div>
                    {item.author_role && <div className="text-xs text-brand-black/70">{item.author_role}</div>}
                  </td>
                  <td className="max-w-md truncate">{item.content}</td>
                  <td>{item.rating}/5</td>
                  <td>{item.is_published ? <span className="text-brand-purple font-semibold">✓</span> : <span className="text-brand-mauve/60">✗</span>}</td>
                  <td>{item.display_order}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-brand-orange hover:text-brand-orange/80" onClick={() => handleDelete(item.id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// CMS: Courses Manager
function CoursesManager() {
  const [items, setItems] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Course | null>(null)
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminCourses()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setEditing({ ...editing, image_url: url })
      alert('Imagen subida exitosamente')
    } catch (err) {
      alert('Error al subir la imagen')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(item: Course) {
    try {
      if (item.id) {
        await updateCourse(item)
      } else {
        await createCourse(item)
      }
      setEditing(null)
      await load()
      alert('Guardado exitosamente')
    } catch {
      alert('Error al guardar')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este curso?')) return
    try {
      await deleteCourse(id)
      await load()
    } catch {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="rounded-xl shadow-lg p-8 bg-gradient-to-br from-brand-purple/10 via-brand-cream to-brand-orange/10 border border-brand-purple/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title text-brand-purple">Cursos</h2>
        <button className="btn-primary bg-brand-purple hover:bg-brand-purple/90 text-white" onClick={() => setEditing({ title: '', description: '', modality: 'virtual', course_type: 'general', is_published: true, display_order: 0 })}>
          Nuevo curso
        </button>
      </div>

      {editing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-brand-orange/20">
          <h3 className="font-serif text-lg mb-4 text-brand-purple">{editing.id ? 'Editar' : 'Nuevo'} Curso</h3>
          <div className="grid gap-4">
            <div>
              <label className="label text-brand-purple">Título</label>
              <input className="input-control border-brand-mauve/50 focus:border-brand-purple focus:ring-brand-purple/20" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="label text-brand-purple">Descripción</label>
              <textarea className="input-control" rows={4} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Precio (opcional)</label>
                <input className="input-control" type="number" step="0.01" value={editing.price || ''} onChange={e => setEditing({ ...editing, price: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="label">Duración</label>
                <input className="input-control" placeholder="Ej: 3 meses" value={editing.duration || ''} onChange={e => setEditing({ ...editing, duration: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Nivel</label>
                <select className="select-control" value={editing.level || ''} onChange={e => setEditing({ ...editing, level: e.target.value })}>
                  <option value="">—</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
              </div>
              <div>
                <label className="label">Modalidad</label>
                <select className="select-control" value={editing.modality || 'virtual'} onChange={e => setEditing({ ...editing, modality: e.target.value })}>
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div>
                <label className="label">Tipo de curso</label>
                <select className="select-control" value={editing.course_type || 'general'} onChange={e => setEditing({ ...editing, course_type: e.target.value })}>
                  <option value="general">General</option>
                  <option value="ingles">Inglés</option>
                  <option value="frances">Francés</option>
                  <option value="espanol">Español para extranjeros</option>
                  <option value="club-conversacional">Club Conversacional</option>
                  <option value="conversarte">ConversArte</option>
                  <option value="tour-cafetero">Tour Cafetero</option>
                  <option value="ninos">Cursos para niños</option>
                  <option value="personalizadas">Clases personalizadas</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Orden</label>
                <input className="input-control" type="number" value={editing.display_order || 0} onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="label">Imagen del curso</label>
              <div className="grid gap-2">
                <input 
                  className="input-control" 
                  placeholder="URL de la imagen (opcional)" 
                  value={editing.image_url || ''} 
                  onChange={e => setEditing({ ...editing, image_url: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-black/60">o subir:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <span className="text-sm text-brand-purple">Subiendo...</span>}
                </div>
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg mt-2" />
                )}
              </div>
            </div>
            <div>
              <label className="label">Programa / Syllabus (opcional)</label>
              <textarea className="input-control" rows={3} value={editing.syllabus || ''} onChange={e => setEditing({ ...editing, syllabus: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_published !== false} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />
                <span className="text-sm">Publicado</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => handleSave(editing)}>Guardar</button>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div className="overflow-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Nivel</th>
                <th>Modalidad</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.title}</td>
                  <td className="text-sm">{item.course_type || 'general'}</td>
                  <td>{item.level || '—'}</td>
                  <td>{item.modality}</td>
                  <td>{item.price ? `$${item.price}` : '—'}</td>
                  <td>{item.is_published ? <span className="text-brand-purple font-semibold">✓</span> : <span className="text-brand-mauve/60">✗</span>}</td>
                  <td>{item.display_order}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-brand-orange hover:text-brand-orange/80" onClick={() => handleDelete(item.id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// CMS: Blog Manager
function BlogManager() {
  const [items, setItems] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminBlogPosts()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setEditing({ ...editing, image_url: url })
      alert('Imagen subida exitosamente')
    } catch (err) {
      alert('Error al subir la imagen')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(item: BlogPost) {
    try {
      if (item.id) {
        await updateBlogPost(item)
      } else {
        await createBlogPost(item)
      }
      setEditing(null)
      await load()
      alert('Guardado exitosamente')
    } catch {
      alert('Error al guardar')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este post?')) return
    try {
      await deleteBlogPost(id)
      await load()
    } catch {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="rounded-xl shadow-lg p-8 bg-gradient-to-br from-brand-yellow/10 via-brand-cream to-brand-mauve/10 border border-brand-yellow/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title text-brand-purple">Blog</h2>
        <button className="btn-primary bg-brand-purple hover:bg-brand-purple/90 text-white" onClick={() => setEditing({ title: '', content: '', is_published: false })}>
          Nuevo post
        </button>
      </div>

      {editing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-brand-yellow/20">
          <h3 className="font-serif text-lg mb-4 text-brand-purple">{editing.id ? 'Editar' : 'Nuevo'} Post</h3>
          <div className="grid gap-4">
            <div>
              <label className="label text-brand-purple">Título</label>
              <input className="input-control border-brand-mauve/50 focus:border-brand-purple focus:ring-brand-purple/20" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="label text-brand-purple">Slug (URL amigable, opcional - se genera automáticamente)</label>
              <input className="input-control border-brand-mauve/50 focus:border-brand-purple focus:ring-brand-purple/20" value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
            </div>
            <div>
              <label className="label">Extracto / Resumen (opcional)</label>
              <textarea className="input-control" rows={2} value={editing.excerpt || ''} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} />
            </div>
            <div>
              <label className="label">Contenido</label>
              <textarea className="input-control" rows={8} value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Categoría (opcional)</label>
                <input className="input-control" placeholder="Ej: Gramática, Tips" value={editing.category || ''} onChange={e => setEditing({ ...editing, category: e.target.value })} />
              </div>
              <div>
                <label className="label">Tags / Etiquetas (separados por coma, opcional)</label>
                <input className="input-control" placeholder="Ej: inglés, A2, gramática" value={editing.tags || ''} onChange={e => setEditing({ ...editing, tags: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Imagen destacada</label>
              <div className="grid gap-2">
                <input 
                  className="input-control" 
                  placeholder="URL de la imagen (opcional)" 
                  value={editing.image_url || ''} 
                  onChange={e => setEditing({ ...editing, image_url: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-black/60">o subir:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <span className="text-sm text-brand-purple">Subiendo...</span>}
                </div>
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg mt-2" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_published !== false} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />
                <span className="text-sm">Publicado</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => handleSave(editing)}>Guardar</button>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div className="overflow-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold max-w-md truncate">{item.title}</td>
                  <td className="text-sm">{item.author_name || item.author_username || '—'}</td>
                  <td className="text-sm">{item.category || '—'}</td>
                  <td>{item.is_published ? <span className="text-brand-purple font-semibold">✓ Publicado</span> : <span className="text-brand-mauve/60">Borrador</span>}</td>
                  <td className="text-sm">{item.published_at ? new Date(item.published_at).toLocaleDateString() : '—'}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-brand-orange hover:text-brand-orange/80" onClick={() => handleDelete(item.id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function VideosManager() {
  const [items, setItems] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Video | null>(null)
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminVideos()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setEditing({ ...editing, thumbnail_url: url })
      alert('Miniatura subida exitosamente')
    } catch (err) {
      alert('Error al subir la imagen')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    
    setUploading(true)
    try {
      const url = await uploadVideo(file)
      setEditing({ ...editing, video_url: url })
      alert('Video subido exitosamente. Puede tardar unos momentos en procesarse.')
    } catch (err) {
      alert('Error al subir el video. Verifica que sea menor a 100MB')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(item: Video) {
    try {
      if (item.id) {
        await updateVideo(item)
      } else {
        await createVideo(item)
      }
      setEditing(null)
      await load()
      alert('Guardado exitosamente')
    } catch {
      alert('Error al guardar')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este video?')) return
    try {
      await deleteVideo(id)
      await load()
    } catch {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="rounded-xl shadow-lg p-8 bg-gradient-to-br from-brand-orange/10 via-brand-cream to-brand-yellow/10 border border-brand-orange/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title text-brand-purple">Videos de Testimonios</h2>
        <button className="btn-primary bg-brand-purple hover:bg-brand-purple/90 text-white" onClick={() => setEditing({ video_url: '', is_published: true, display_order: 0 })}>
          Nuevo video
        </button>
      </div>

      {editing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-brand-orange/20">
          <h3 className="font-serif text-lg mb-4 text-brand-purple">{editing.id ? 'Editar' : 'Nuevo'} Video</h3>
          <div className="grid gap-3">
            <div>
              <label className="label">Video</label>
              <div className="grid gap-2">
                <input 
                  className="input-control" 
                  placeholder="URL del video (YouTube/Vimeo embed)" 
                  value={editing.video_url} 
                  onChange={e => setEditing({ ...editing, video_url: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-black/60">o subir video:</span>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <span className="text-sm text-brand-purple">Subiendo video... (puede tardar varios minutos)</span>}
                </div>
                {editing.video_url && !editing.video_url.includes('youtube') && !editing.video_url.includes('vimeo') && (
                  <video src={editing.video_url} controls className="w-full h-48 rounded-lg mt-2" />
                )}
              </div>
            </div>
            <div>
              <label className="label">Título (opcional)</label>
              <input className="input-control" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Miniatura del video</label>
              <div className="grid gap-2">
                <input 
                  className="input-control" 
                  placeholder="URL de la miniatura (opcional)" 
                  value={editing.thumbnail_url || ''} 
                  onChange={e => setEditing({ ...editing, thumbnail_url: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-black/60">o subir:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <span className="text-sm text-brand-purple">Subiendo...</span>}
                </div>
                {editing.thumbnail_url && (
                  <img src={editing.thumbnail_url} alt="Preview" className="w-32 h-24 object-cover rounded-lg mt-2" />
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Orden</label>
                <input className="input-control" type="number" value={editing.display_order || 0} onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={editing.is_published !== false} onChange={e => setEditing({ ...editing, is_published: e.target.checked })} />
                  <span className="text-sm">Publicado</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => handleSave(editing)}>Guardar</button>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div className="overflow-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Título</th>
                <th>URL</th>
                <th>Estado</th>
                <th>Orden</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="max-w-xs truncate">{item.title || 'Sin título'}</td>
                  <td className="text-sm max-w-md truncate">{item.video_url}</td>
                  <td>{item.is_published ? <span className="text-brand-purple font-semibold">✓ Publicado</span> : <span className="text-brand-mauve/60">Oculto</span>}</td>
                  <td className="text-sm">{item.display_order}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-brand-orange hover:text-brand-orange/80" onClick={() => handleDelete(item.id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============ PRODUCTS MANAGER ============
interface Product {
  id?: number
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  is_active: boolean
}

function ProductsManager() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [uploading, setUploading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/products.php')
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error('Error loading products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setEditing({ ...editing, image_url: url })
      alert('Imagen subida exitosamente')
    } catch (err) {
      alert('Error al subir la imagen')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(item: Product) {
    try {
      const method = item.id ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/products.php', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      if (!res.ok) throw new Error('Error saving')
      setEditing(null)
      await load()
      alert('Guardado exitosamente')
    } catch (err) {
      alert('Error al guardar')
      console.error(err)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      const res = await fetch('/api/admin/products.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Error deleting')
      await load()
    } catch (err) {
      alert('Error al eliminar')
      console.error(err)
    }
  }

  return (
    <div className="rounded-xl shadow-lg p-8 bg-gradient-to-br from-brand-mauve/20 via-brand-cream to-brand-yellow/10 border border-brand-mauve/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title text-brand-purple">Productos</h2>
        <button className="btn-primary bg-brand-purple hover:bg-brand-purple/90 text-white" onClick={() => setEditing({ name: '', description: '', price: 0, image_url: '', category: 'general', stock: 0, is_active: true })}>
          Nuevo producto
        </button>
      </div>

      {editing && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-brand-mauve/20">
          <h3 className="font-serif text-lg mb-4 text-brand-purple">{editing.id ? 'Editar' : 'Nuevo'} Producto</h3>
          <div className="grid gap-4">
            <div>
              <label className="label text-brand-purple">Nombre</label>
              <input className="input-control border-brand-mauve/50 focus:border-brand-purple focus:ring-brand-purple/20" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea className="input-control" rows={3} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Precio</label>
                <input className="input-control" type="number" step="0.01" value={editing.price || 0} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Stock</label>
                <input className="input-control" type="number" value={editing.stock || 0} onChange={e => setEditing({ ...editing, stock: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select className="select-control" value={editing.category || 'general'} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                <option value="general">General</option>
                <option value="curso">Curso</option>
                <option value="material">Material</option>
                <option value="club">Club</option>
                <option value="taller">Taller</option>
              </select>
            </div>
            <div>
              <label className="label">Imagen del producto</label>
              <div className="grid gap-2">
                <input 
                  className="input-control" 
                  placeholder="URL de la imagen (opcional)" 
                  value={editing.image_url || ''} 
                  onChange={e => setEditing({ ...editing, image_url: e.target.value })} 
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-brand-black/60">o subir:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="text-sm"
                  />
                  {uploading && <span className="text-sm text-brand-purple">Subiendo...</span>}
                </div>
                {editing.image_url && (
                  <img src={editing.image_url} alt="Preview" className="w-32 h-32 object-cover rounded-lg mt-2" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active !== false} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                <span className="text-sm">Activo</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary" onClick={() => handleSave(editing)}>Guardar</button>
              <button className="btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p>Cargando...</p> : (
        <div className="overflow-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="font-semibold">{item.name}</td>
                  <td>{item.category}</td>
                  <td>${item.price}</td>
                  <td>{item.stock}</td>
                  <td>{item.is_active ? <span className="text-brand-purple font-semibold">✓</span> : <span className="text-brand-mauve/60">✗</span>}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-brand-orange hover:text-brand-orange/80" onClick={() => handleDelete(item.id!)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
