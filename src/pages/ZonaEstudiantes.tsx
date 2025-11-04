import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, logout as apiLogout, me as apiMe, getStudentProgress, type StudentProgress, getScheduleSlots, createReservation, getMyReservations, cancelReservation, type ScheduleSlot, type Reservation } from '../services/api'

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await apiLogin(user, pass, email)
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={onSubmit} method="post" action="#" className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Ingreso de estudiantes</h2>
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="username">Usuario</label>
      <input 
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
        placeholder="" 
        value={user} 
        onChange={(e) => setUser(e.target.value)} 
        required
      />
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Correo electrónico</label>
      <input 
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
        placeholder="" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">Contraseña</label>
      <div className="relative mb-4">
        <input 
          id="password"
          name="password"
          autoComplete="current-password"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
          type={showPassword ? "text" : "password"}
          placeholder="••••••••" 
          value={pass} 
          onChange={(e) => setPass(e.target.value)} 
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mb-4 text-center font-semibold">{error}</p>}
      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}

export default function ZonaEstudiantes() {
  const navigate = useNavigate()
  const [user, setUser] = useState<{ username: string; name: string; role: string } | null>(null)
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [reservas, setReservas] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(false)

  async function loadStudentData() {
    setLoadingData(true)
    try {
      const [prog, slotsData, reservasData] = await Promise.all([
        getStudentProgress(),
        getScheduleSlots(),
        getMyReservations()
      ])
      setProgress(prog)
      setSlots(slotsData)
      setReservas(reservasData)
    } catch (err) {
      console.error('Error loading student data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const u = await apiMe()
        if (u && u.role === 'admin') { navigate('/admin', { replace: true }); return }
        if (u && u.role === 'teacher') { navigate('/profesor', { replace: true }); return }
        setUser(u ? { username: u.username, name: u.name, role: u.role } : null)
        if (u && u.role === 'student') {
          await loadStudentData()
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function handleLogout() {
    await apiLogout()
    setUser(null)
    setProgress(null)
    setSlots([])
    setReservas([])
  }

  return (
    <main className="bg-brand-beige">
      <div className="container-padded py-12">
        <h1 className="text-4xl font-extrabold text-center mb-8">Zona de estudiantes</h1>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-xl text-gray-500">Cargando…</p>
          </div>
        ) : !user ? (
          <div className="flex justify-center items-center py-8">
            <Login onSuccess={async () => {
              const u = await apiMe();
              if (u && u.role === 'admin') { navigate('/admin', { replace: true }); return }
              if (u && u.role === 'teacher') { navigate('/profesor', { replace: true }); return }
              setUser(u ? { username: u.username, name: u.name, role: u.role } : null)
              if (u && u.role === 'student') {
                await loadStudentData()
              }
            }} />
          </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-brand-black/70">
              Sesión: <span className="font-semibold">{user.name || user.username}</span> ({user.role})
            </div>
            <button className="btn-secondary" onClick={handleLogout}>Salir</button>
          </div>
          {loadingData ? (
            <div className="mt-6">
              <p>Cargando datos del estudiante…</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
            <section className="card">
              <h2 className="section-title">Progreso</h2>
              {!progress ? (
                <p className="text-sm text-brand-black/70 mt-2">Cargando progreso…</p>
              ) : (
                <div className="mt-2 text-sm text-brand-black/80 space-y-2">
                  <div><strong>Asistencia:</strong> {progress.asistencia}%</div>
                  <div>
                    <strong>Nivel (MCER):</strong> {progress.nivel.mcer}
                    <div className="text-brand-black/70">{progress.nivel.descripcion}</div>
                  </div>
                  <div>
                    <strong>Notas:</strong>
                    <ul className="list-disc pl-5 mt-1">
                      {progress.notas.map((n, idx) => (
                        <li key={idx}>{n.actividad}: {n.nota} ({n.fecha})</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Fortalezas:</strong> {progress.fortalezas.join(', ')}
                  </div>
                  <div>
                    <strong>Debilidades:</strong> {progress.debilidades.join(', ')}
                  </div>
                </div>
              )}
            </section>
            <section className="card">
              <h2 className="section-title">Horarios / Agendar</h2>
              <p className="text-sm text-brand-black/70">Agenda clases personalizadas y exámenes.</p>
              <ScheduleSection slots={slots} reservas={reservas} onBooked={async () => setReservas(await getMyReservations())} onCancel={async () => setReservas(await getMyReservations())} />
            </section>
            <section className="card">
              <h2 className="section-title">Mascota MCER</h2>
              <div className="mt-2 aspect-square rounded-xl bg-gradient-to-br from-brand-purple to-brand-amber" />
            </section>
          </div>
          )}
        </>
      )}
      </div>
    </main>
  )
}

function ScheduleSection({ slots, reservas, onBooked, onCancel }: { slots: ScheduleSlot[]; reservas: Reservation[]; onBooked: () => void; onCancel: () => void }) {
  const [selected, setSelected] = useState<ScheduleSlot | null>(null)
  const [notas, setNotas] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  async function reservar() {
    if (!selected) { setError('Selecciona un horario'); return }
    setLoading(true); setError(''); setOk('')
    try {
      await createReservation({ 
        datetime: selected.datetime, 
        tipo: selected.tipo, 
        modalidad: selected.modalidad, 
        notas: notas || undefined,
        slot_id: selected.id
      })
      setOk('Reserva creada')
      setSelected(null); setNotas('')
      await onBooked()
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No se pudo crear la reserva')
    } finally {
      setLoading(false)
    }
  }

  async function cancelar(id: number) {
    setLoading(true); setError(''); setOk('')
    try {
      await cancelReservation(id)
      await onCancel()
      setOk('Reserva cancelada')
    } catch {
      setError('No se pudo cancelar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <div className="grid gap-3">
        <select 
          className="select-control" 
          value={selected?.id || ''} 
          onChange={(e) => {
            const slot = slots.find(s => s.id === Number(e.target.value))
            setSelected(slot || null)
          }}
        >
          <option value="">Selecciona un horario</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {new Date(s.datetime).toLocaleString()} - {s.tipo} ({s.modalidad})
            </option>
          ))}
        </select>
        <input className="input-control" placeholder="Notas (opcional)" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </div>
      <div className="mt-3">
        <button className="btn-primary" disabled={loading} onClick={reservar}>{loading ? 'Procesando…' : 'Agendar'}</button>
        {error && <span className="text-red-600 text-sm ml-3">{error}</span>}
        {ok && <span className="text-green-600 text-sm ml-3">{ok}</span>}
      </div>

      <div className="mt-5">
        <h3 className="font-serif text-lg">Mis reservas</h3>
        {reservas.length === 0 ? (
          <p className="text-sm text-brand-black/70 mt-2">Aún no tienes reservas.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {reservas.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl p-3 bg-gradient-to-r from-brand-black/[0.05] to-transparent">
                <div className="text-sm">
                  <div className="flex items-center gap-2"><span className="badge-role-student">{r.tipo}</span> <span>{new Date(r.datetime).toLocaleString()}</span> <span className="badge-role-teacher">{r.modalidad}</span></div>
                  {r.notas && <div className="text-brand-black/70 mt-1">{r.notas}</div>}
                </div>
                <button className="btn-ghost underline" disabled={loading} onClick={() => cancelar(r.id)}>Cancelar</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
