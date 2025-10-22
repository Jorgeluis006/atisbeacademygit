import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { me, getTeacherStudents, type TeacherGroupedStudents, logout as apiLogout, getStudentProgressFor, saveStudentProgress, type StudentProgress } from '../services/api'

export default function Profesor() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<{ username: string; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<TeacherGroupedStudents>({})
  const [allStudents, setAllStudents] = useState<{ username: string; name?: string }[]>([])
  const [selStudent, setSelStudent] = useState<string>('')
  const [prog, setProg] = useState<StudentProgress | null>(null)
  const [saving, setSaving] = useState(false)

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