import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, logout as apiLogout, me as apiMe, getStudentProgress, type StudentProgress, getScheduleSlots, createReservation, getMyReservations, cancelReservation, type ScheduleSlot, type Reservation } from '../services/api'

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await apiLogin(user, pass)
      onSuccess()
    } catch (err) {
      setError('Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={onSubmit} className="card max-w-md">
      <h2 className="font-serif text-2xl mb-4">Ingreso de estudiantes</h2>
      <label className="label">Usuario</label>
      <input className="input-control mb-2" placeholder="Usuario" value={user} onChange={(e) => setUser(e.target.value)} />
      <label className="label">Contraseña</label>
      <input className="input-control mb-3" type="password" placeholder="Contraseña" value={pass} onChange={(e) => setPass(e.target.value)} />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar'}</button>
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
  useEffect(() => {
    (async () => {
      try {
        const u = await apiMe()
        if (u && u.role === 'admin') { navigate('/admin', { replace: true }); return }
        if (u && u.role === 'teacher') { navigate('/profesor', { replace: true }); return }
        setUser(u ? { username: u.username, name: u.name, role: u.role } : null)
        if (u && u.role === 'student') {
          try {
            setProgress(await getStudentProgress())
            setSlots(await getScheduleSlots())
            setReservas(await getMyReservations())
          } catch {}
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
  }

  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Zona de estudiantes</h1>
      {loading ? (
        <p className="mt-6">Cargando…</p>
      ) : !user ? (
        <div className="mt-6">
          <Login onSuccess={async () => {
            const u = await apiMe();
            if (u && u.role === 'admin') { navigate('/admin', { replace: true }); return }
            if (u && u.role === 'teacher') { navigate('/profesor', { replace: true }); return }
            setUser(u ? { username: u.username, name: u.name, role: u.role } : null)
          }} />
        </div>
      ) : (
        <>
          <div className="mt-2 text-sm text-brand-black/70">Sesión: {user.name || user.username} ({user.role}) <button className="underline ml-2" onClick={handleLogout}>Salir</button></div>
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
        </>
      )}
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
