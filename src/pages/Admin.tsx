import { useEffect, useState } from 'react'
import { me, createUser, listUsers, type AdminUser, resetUserPassword, EXPORT_CONTACTS_URL, EXPORT_RESERVATIONS_URL } from '../services/api'

export default function Admin() {
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
      <h1 className="text-3xl font-extrabold">Panel de administración</h1>

      <section className="bg-white rounded-2xl p-6 shadow-soft mt-6 max-w-xl">
        <h2 className="font-serif text-xl mb-4">Crear usuario</h2>
        <CreateUserForm onDone={(m) => { setMsg(m); setErr('') }} onError={(e) => { setErr(e); setMsg('') }} />
      </section>

      <UsersList />

      <section className="bg-white rounded-2xl p-6 shadow-soft mt-6 max-w-xl">
        <h2 className="font-serif text-xl mb-4">Exportar datos</h2>
        <div className="flex gap-3">
          <a className="btn-primary" href={EXPORT_CONTACTS_URL}>Descargar contactos CSV</a>
          <a className="btn-primary" href={EXPORT_RESERVATIONS_URL}>Descargar reservas CSV</a>
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
  const [role, setRole] = useState<'student' | 'admin'>('student')
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
      <input className="border rounded-md px-3 py-2 w-full" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border rounded-md px-3 py-2 w-full" placeholder="Nombre (opcional)" value={name} onChange={e => setName(e.target.value)} />
      <input className="border rounded-md px-3 py-2 w-full" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      <select className="border rounded-md px-3 py-2" value={role} onChange={e => setRole(e.target.value as any)}>
        <option value="student">Estudiante</option>
        <option value="admin">Admin</option>
      </select>
      <div>
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Creando…' : 'Crear'}</button>
      </div>
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
    <section className="bg-white rounded-2xl p-6 shadow-soft mt-6">
      <h2 className="font-serif text-xl mb-4">Usuarios</h2>
      <div className="flex gap-3 items-center mb-3">
        <input className="border rounded-md px-3 py-2 w-full max-w-sm" placeholder="Buscar por usuario o nombre" value={q} onChange={e => { setPage(1); setQ(e.target.value) }} />
        <button className="btn-primary" onClick={load}>Buscar</button>
      </div>
      {loading ? <p>Cargando…</p> : (
        <div className="overflow-auto">
          <table className="min-w-[600px] w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Usuario</th>
                <th className="py-2 pr-2">Nombre</th>
                <th className="py-2 pr-2">Rol</th>
                <th className="py-2 pr-2">Creado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="py-2 pr-2">{u.username}</td>
                  <td className="py-2 pr-2">{u.name || '-'}</td>
                  <td className="py-2 pr-2">{u.role}</td>
                  <td className="py-2 pr-2">{new Date(u.created_at).toLocaleString()}</td>
                  <td className="py-2">
                    <button className="text-brand-purple underline" onClick={() => doReset(u)}>Resetear contraseña</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-3 mt-3">
        <button className="btn-primary" disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))}>Anterior</button>
        <span>Página {page} de {pages}</span>
        <button className="btn-primary" disabled={page>=pages} onClick={() => setPage(p => Math.min(pages, p+1))}>Siguiente</button>
      </div>
    </section>
  )
}
