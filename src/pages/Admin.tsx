import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { me, createUser, listUsers, type AdminUser, resetUserPassword, EXPORT_CONTACTS_URL, EXPORT_RESERVATIONS_URL, assignStudent, logout as apiLogout } from '../services/api'

export default function Admin() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<{ username: string; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Panel de administración</h1>
        <button className="btn-secondary" onClick={async () => { try { await apiLogout() } finally { navigate('/', { replace: true }) } }}>Salir</button>
      </div>

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
