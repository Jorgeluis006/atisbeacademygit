import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { me, getTeacherStudents, type TeacherGroupedStudents, logout as apiLogout } from '../services/api'

export default function Profesor() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<{ username: string; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<TeacherGroupedStudents>({})

  useEffect(() => {
    (async () => {
      try {
        const u = await me()
        if (u && u.role === 'teacher') {
          setAuth({ username: u.username, name: u.name, role: u.role })
          setGroups(await getTeacherStudents())
        }
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <main className="container-padded py-12"><p>Cargando…</p></main>
  if (!auth) return (
    <main className="container-padded py-12">
      <h1 className="text-3xl font-extrabold">Panel de profesor</h1>
      <p className="mt-4 text-brand-black/70">No autorizado. Inicia sesión con una cuenta de profesor.</p>
    </main>
  )

  const levels = Object.keys(groups)

  return (
    <main className="container-padded py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Panel de profesor</h1>
          <p className="text-sm text-brand-black/70 mt-1">Sesión: {auth.name || auth.username}</p>
        </div>
        <button className="btn-secondary" onClick={async () => { try { await apiLogout() } finally { navigate('/', { replace: true }) } }}>Salir</button>
      </div>

      {levels.length === 0 ? (
        <p className="mt-6">Aún no tienes estudiantes asignados.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {levels.map(level => (
            <section key={level} className="card">
              <h2 className="section-title">Nivel {level}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <StudentList title="Virtual" items={groups[level]?.virtual || []} />
                <StudentList title="Presencial" items={groups[level]?.presencial || []} />
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  )
}

function StudentList({ title, items }: { title: string; items: any[] }) {
  return (
    <div>
      <h3 className="font-serif text-lg mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-brand-black/70">Sin estudiantes</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} className="rounded-xl p-3 flex items-center justify-between bg-gradient-to-r from-brand-black/[0.05] to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center text-brand-purple font-semibold">
                  {(s.name || s.username).substring(0,1).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{s.name || s.username}</div>
                  <div className="text-brand-black/70 text-xs">{s.username}</div>
                </div>
              </div>
              {/* acciones futuras: ver progreso, contactar, etc. */}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}