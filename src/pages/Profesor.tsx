import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  me, 
  getTeacherStudents, 
  type TeacherGroupedStudents, 
  logout as apiLogout, 
  getStudentProgressFor, 
  saveStudentProgress, 
  type StudentProgress,
  getTeacherSlots,
  createTeacherSlot,
  deleteTeacherSlot,
  getTeacherReservations,
  type ScheduleSlot,
  type Reservation
} from '../services/api'

export default function Profesor() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<{ username: string; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<TeacherGroupedStudents>({})
  const [allStudents, setAllStudents] = useState<{ username: string; name?: string }[]>([])
  const [selStudent, setSelStudent] = useState<string>('')
  const [prog, setProg] = useState<StudentProgress | null>(null)
  const [saving, setSaving] = useState(false)

  // Slots y reservas
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [newSlot, setNewSlot] = useState({ datetime: '', tipo: 'clase', modalidad: 'virtual', duration_minutes: 60 })
  const [creatingSlot, setCreatingSlot] = useState(false)

  async function handleCreateSlot() {
    if (!newSlot.datetime) {
      alert('Por favor selecciona una fecha y hora')
      return
    }
    setCreatingSlot(true)
    try {
      await createTeacherSlot(newSlot)
      const updated = await getTeacherSlots()
      setSlots(updated)
      setNewSlot({ datetime: '', tipo: 'clase', modalidad: 'virtual', duration_minutes: 60 })
      alert('Horario creado exitosamente')
    } catch (err: any) {
      alert(err?.response?.data?.error || 'No se pudo crear el horario')
    } finally {
      setCreatingSlot(false)
    }
  }

  async function handleDeleteSlot(id: number) {
    if (!confirm('¿Eliminar este horario?')) return
    try {
      await deleteTeacherSlot(id)
      const updated = await getTeacherSlots()
      setSlots(updated)
    } catch (err: any) {
      alert(err?.response?.data?.error || 'No se pudo eliminar')
    }
  }


  function addNote() {
    if (!prog) return
    setProg({ ...prog, notas: [...prog.notas, { actividad: '', nota: 0, fecha: '' }] })
  }
  function updateNote(idx: number, patch: Partial<{ actividad: string; nota: number; fecha: string }>) {
    if (!prog) return
    const notas = prog.notas.map((n, i) => i === idx ? { ...n, ...patch } : n)
    setProg({ ...prog, notas })
  }
  function removeNote(idx: number) {
    if (!prog) return
    const notas = prog.notas.filter((_, i) => i !== idx)
    setProg({ ...prog, notas })
  }

  useEffect(() => {
    (async () => {
      try {
        const u = await me()
        if (u && u.role === 'teacher') {
          setAuth({ username: u.username, name: u.name, role: u.role })
          const gs = await getTeacherStudents()
          setGroups(gs)
          // aplanar lista de estudiantes
          const flat: { username: string; name?: string }[] = []
          Object.keys(gs).forEach(k => {
            const g = gs[k] as { virtual: any[]; presencial: any[]; ['sin-definir']: any[] }
            ;(['virtual','presencial','sin-definir'] as const).forEach(mod => {
              (g?.[mod] || []).forEach((s: any) => flat.push({ username: s.username, name: s.name }))
            })
          })
          setAllStudents(flat)
          // Cargar slots y reservas del profesor
          const [slotsRes, reservationsRes] = await Promise.all([
            getTeacherSlots(),
            getTeacherReservations()
          ])
          setSlots(slotsRes)
          setReservations(reservationsRes)
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

      {/* Gestión de horarios */}
      <section className="card mt-6">
        <h2 className="section-title">Gestión de horarios</h2>
        <p className="text-sm text-brand-black/70 mb-4">Crea horarios disponibles para que tus estudiantes los reserven.</p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end mb-6">
          <div className="lg:col-span-2">
            <label className="label">Fecha y hora</label>
            <input 
              type="datetime-local" 
              className="input-control" 
              value={newSlot.datetime} 
              onChange={e => setNewSlot({ ...newSlot, datetime: e.target.value })} 
            />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="select-control" value={newSlot.tipo} onChange={e => setNewSlot({ ...newSlot, tipo: e.target.value })}>
              <option value="clase">Clase</option>
              <option value="examen">Examen</option>
            </select>
          </div>
          <div>
            <label className="label">Modalidad</label>
            <select className="select-control" value={newSlot.modalidad} onChange={e => setNewSlot({ ...newSlot, modalidad: e.target.value })}>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>
          <div>
            <button 
              className="btn-primary w-full" 
              disabled={creatingSlot || !newSlot.datetime} 
              onClick={handleCreateSlot}
            >
              {creatingSlot ? 'Creando...' : 'Crear horario'}
            </button>
          </div>
        </div>

        {slots.length === 0 ? (
          <p className="text-sm text-brand-black/70">No tienes horarios creados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => {
                  const dt = new Date(slot.datetime)
                  return (
                    <tr key={slot.id}>
                      <td>{dt.toLocaleString('es-ES')}</td>
                      <td><span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${slot.tipo === 'examen' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{slot.tipo}</span></td>
                      <td>{slot.modalidad}</td>
                      <td>{slot.duration_minutes || 60} min</td>
                      <td><span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Disponible</span></td>
                      <td>
                        <button className="btn-ghost text-sm" onClick={() => handleDeleteSlot(slot.id!)}>Eliminar</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reservas de estudiantes */}
      <section className="card mt-6">
        <h2 className="section-title">Reservas de estudiantes</h2>
        {reservations.length === 0 ? (
          <p className="text-sm text-brand-black/70">Aún no hay reservas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-clean">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Fecha y hora</th>
                  <th>Tipo</th>
                  <th>Modalidad</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => {
                  const dt = new Date(res.datetime)
                  return (
                    <tr key={res.id}>
                      <td>
                        <div className="font-semibold">{res.student_name || res.student_username}</div>
                        <div className="text-xs text-brand-black/70">{res.student_username}</div>
                      </td>
                      <td>{dt.toLocaleString('es-ES')}</td>
                      <td><span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${res.tipo === 'examen' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{res.tipo}</span></td>
                      <td>{res.modalidad}</td>
                      <td className="text-sm text-brand-black/70">{res.notas || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Editor de progreso */}
      <section className="card mt-6">
        <h2 className="section-title">Editar progreso del estudiante</h2>
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="label">Selecciona estudiante</label>
            <select className="select-control" value={selStudent} onChange={async (e) => {
              const u = e.target.value; setSelStudent(u); setProg(null)
              if (u) {
                try { const res = await getStudentProgressFor(u); setProg(res.progreso) } catch {}
              }
            }}>
              <option value="">—</option>
              {allStudents.map(s => <option key={s.username} value={s.username}>{s.username}{s.name ? ` — ${s.name}` : ''}</option>)}
            </select>
          </div>
          <div>
            <button className="btn-primary w-full" disabled={!selStudent || !prog || saving} onClick={async () => {
              if (!selStudent || !prog) return; setSaving(true)
              try { await saveStudentProgress({ student_username: selStudent, progreso: prog }); alert('Progreso actualizado'); }
              catch { alert('No se pudo guardar'); }
              finally { setSaving(false) }
            }}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </div>

        {prog && (
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Asistencia (%)</label>
              <input type="number" min={0} max={100} className="input-control" value={prog.asistencia} onChange={e => setProg({ ...prog, asistencia: Math.max(0, Math.min(100, Number(e.target.value)||0)) })} />
            </div>
            <div>
              <label className="label">Nivel (MCER)</label>
              <select className="select-control" value={prog.nivel.mcer} onChange={e => setProg({ ...prog, nivel: { ...prog.nivel, mcer: e.target.value } })}>
                <option value="">—</option>
                {['A1','A2','B1','B2','C1','C2'].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Descripción nivel</label>
              <textarea className="input-control" rows={3} value={prog.nivel.descripcion} onChange={e => setProg({ ...prog, nivel: { ...prog.nivel, descripcion: e.target.value } })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notas</label>
              <div className="space-y-2">
                {prog.notas.length === 0 && (
                  <p className="text-sm text-brand-black/70">Aún no hay notas. Agrega la primera.</p>
                )}
                {prog.notas.map((n, idx) => (
                  <div key={idx} className="grid sm:grid-cols-[1fr_110px_170px_auto] gap-2">
                    <input className="input-control" placeholder="Actividad" value={n.actividad} onChange={e => updateNote(idx, { actividad: e.target.value })} />
                    <input className="input-control" type="number" step={0.1} min={0} max={5} placeholder="Nota" value={Number.isFinite(n.nota) ? n.nota : 0} onChange={e => updateNote(idx, { nota: Math.max(0, Math.min(5, Number(e.target.value)||0)) })} />
                    <input className="input-control" type="date" value={n.fecha || ''} onChange={e => updateNote(idx, { fecha: e.target.value })} />
                    <button type="button" className="btn-secondary" onClick={() => removeNote(idx)}>Eliminar</button>
                  </div>
                ))}
                <button type="button" className="btn-ghost" onClick={addNote}>+ Añadir nota</button>
              </div>
            </div>
            <div>
              <label className="label">Fortalezas (separadas por coma)</label>
              <textarea className="input-control" rows={5} value={prog.fortalezas.join(', ')} onChange={e => setProg({ ...prog, fortalezas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Debilidades (separadas por coma)</label>
              <textarea className="input-control" rows={3} value={prog.debilidades.join(', ')} onChange={e => setProg({ ...prog, debilidades: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </div>
          </div>
        )}
      </section>

      {/* Lista de estudiantes agrupados */}
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