import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  me, 
  createUser, 
  listUsers, 
  type AdminUser, 
  resetUserPassword, 
  EXPORT_CONTACTS_URL, 
  EXPORT_RESERVATIONS_URL, 
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
  type BlogPost
} from '../services/api'

export default function Admin() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<{ username: string; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'testimonials' | 'courses' | 'blog'>('users')

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
    <main className="container-padded py-12">
      <h1 className="text-3xl font-extrabold">Admin</h1>
      <p className="mt-4 text-brand-black/70">No autorizado. Inicia sesión con una cuenta admin.</p>
    </main>
  )

  return (
    <main className="container-padded py-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold">Panel de administración</h1>
        <button className="btn-secondary" onClick={async () => { try { await apiLogout() } finally { navigate('/', { replace: true }) } }}>Salir</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-black/10 mb-6">
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
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <>
          <section className="card mt-6 max-w-xl">
            <h2 className="section-title">Crear usuario</h2>
            <CreateUserForm onDone={(m) => { setMsg(m); setErr('') }} onError={(e) => { setErr(e); setMsg('') }} />
          </section>

          <section className="card mt-6 max-w-2xl">
            <h2 className="section-title">Asignar estudiante a profesor</h2>
            <AssignStudentForm onDone={(m) => { setMsg(m); setErr('') }} onError={(e) => { setErr(e); setMsg('') }} />
          </section>

          <UsersList />

          <section className="card mt-6 max-w-xl">
            <h2 className="section-title">Exportar datos</h2>
            <div className="flex gap-3 flex-wrap">
              <a className="btn-secondary" href={EXPORT_CONTACTS_URL}>Descargar contactos CSV</a>
              <a className="btn-secondary" href={EXPORT_RESERVATIONS_URL}>Descargar reservas CSV</a>
            </div>
          </section>
        </>
      )}

      {activeTab === 'testimonials' && <TestimonialsManager />}
      {activeTab === 'courses' && <CoursesManager />}
      {activeTab === 'blog' && <BlogManager />}

      {(msg || err) && (
        <div className="mt-4">
          {msg && <p className="text-green-700">{msg}</p>}
          {err && <p className="text-red-600">{err}</p>}
        </div>
      )}
    </main>
  )
}

function CreateUserForm({ onDone, onError }: { onDone: (msg: string) => void; onError: (err: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'student' | 'admin' | 'teacher'>('student')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) { onError('Usuario y contraseña son requeridos'); return }
    setLoading(true)
    try {
      await createUser({ username, password, name, role })
      setUsername(''); setPassword(''); setName(''); setRole('student')
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

  return (
    <section className="card mt-6">
      <h2 className="section-title">Usuarios</h2>
      <div className="flex gap-3 items-center mb-3 flex-wrap">
        <input className="input-control w-full max-w-sm" placeholder="Buscar por usuario o nombre" value={q} onChange={e => { setPage(1); setQ(e.target.value) }} />
        <button className="btn-secondary" onClick={load}>Buscar</button>
      </div>
      {loading ? <p>Cargando…</p> : (
        <div className="overflow-auto">
          <table className="table-clean">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
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
                  <td>
                    {u.role === 'admin' && <span className="badge-role-admin">Admin</span>}
                    {u.role === 'teacher' && <span className="badge-role-teacher">Profesor</span>}
                    {u.role === 'student' && <span className="badge-role-student">Estudiante</span>}
                  </td>
                  <td>{new Date(u.created_at).toLocaleString()}</td>
                  <td>
                    <button className="btn-ghost underline" onClick={() => doReset(u)}>Resetear contraseña</button>
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

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminTestimonials()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title">Testimonios</h2>
        <button className="btn-primary" onClick={() => setEditing({ author_name: '', content: '', rating: 5, is_published: true, display_order: 0 })}>
          Nuevo testimonio
        </button>
      </div>

      {editing && (
        <div className="card mb-6">
          <h3 className="font-serif text-lg mb-3">{editing.id ? 'Editar' : 'Nuevo'} Testimonio</h3>
          <div className="grid gap-3">
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
              <label className="label">URL de imagen (opcional)</label>
              <input className="input-control" value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} />
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
                  <td>{item.is_published ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>}</td>
                  <td>{item.display_order}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-red-600" onClick={() => handleDelete(item.id!)}>Eliminar</button>
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

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminCourses()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title">Cursos</h2>
        <button className="btn-primary" onClick={() => setEditing({ title: '', description: '', modality: 'virtual', is_published: true, display_order: 0 })}>
          Nuevo curso
        </button>
      </div>

      {editing && (
        <div className="card mb-6">
          <h3 className="font-serif text-lg mb-3">{editing.id ? 'Editar' : 'Nuevo'} Curso</h3>
          <div className="grid gap-3">
            <div>
              <label className="label">Título</label>
              <input className="input-control" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Descripción</label>
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
                <label className="label">Orden</label>
                <input className="input-control" type="number" value={editing.display_order || 0} onChange={e => setEditing({ ...editing, display_order: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="label">URL de imagen (opcional)</label>
              <input className="input-control" value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} />
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
                  <td>{item.level || '—'}</td>
                  <td>{item.modality}</td>
                  <td>{item.price ? `$${item.price}` : '—'}</td>
                  <td>{item.is_published ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>}</td>
                  <td>{item.display_order}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-red-600" onClick={() => handleDelete(item.id!)}>Eliminar</button>
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

  async function load() {
    setLoading(true)
    try {
      const data = await getAdminBlogPosts()
      setItems(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="section-title">Blog</h2>
        <button className="btn-primary" onClick={() => setEditing({ title: '', content: '', is_published: false })}>
          Nuevo post
        </button>
      </div>

      {editing && (
        <div className="card mb-6">
          <h3 className="font-serif text-lg mb-3">{editing.id ? 'Editar' : 'Nuevo'} Post</h3>
          <div className="grid gap-3">
            <div>
              <label className="label">Título</label>
              <input className="input-control" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Slug (URL amigable, opcional - se genera automáticamente)</label>
              <input className="input-control" value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} />
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
              <label className="label">URL de imagen destacada (opcional)</label>
              <input className="input-control" value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} />
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
                  <td>{item.is_published ? <span className="text-green-600">✓ Publicado</span> : <span className="text-gray-400">Borrador</span>}</td>
                  <td className="text-sm">{item.published_at ? new Date(item.published_at).toLocaleDateString() : '—'}</td>
                  <td className="flex gap-2">
                    <button className="btn-ghost text-sm" onClick={() => setEditing(item)}>Editar</button>
                    <button className="btn-ghost text-sm text-red-600" onClick={() => handleDelete(item.id!)}>Eliminar</button>
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
