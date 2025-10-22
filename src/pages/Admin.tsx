import { useEffect, useState } from 'react'
import { me, createUser, disableDemoUser } from '../services/api'

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

      <section className="bg-white rounded-2xl p-6 shadow-soft mt-6 max-w-xl">
        <h2 className="font-serif text-xl mb-4">Usuario demo</h2>
        <p className="text-sm text-brand-black/70 mb-3">Eliminar el usuario demo y evitar que se vuelva a crear.</p>
        <button className="btn-primary" onClick={async () => {
          setMsg(''); setErr('')
          try { await disableDemoUser(); setMsg('Usuario demo eliminado'); }
          catch { setErr('No se pudo eliminar el demo'); }
        }}>Eliminar demo</button>
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
