import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  me,
  logout as apiLogout,
  getCoordinatorTeachers,
  getCoordinatorTeacherSlots,
  createCoordinatorTeacherSlot,
  deleteCoordinatorTeacherSlot,
  updateCoordinatorTeacherSlotMeetingLink,
  getCoordinatorBlocks,
  createCoordinatorBlock,
  deleteCoordinatorBlock,
  getAdminClassStructureDocs,
  createClassStructureDoc,
  updateClassStructureDoc,
  deleteClassStructureDoc,
  uploadClassStructurePdf,
  type ClassStructureDoc,
  type CoordinatorTeacher,
  type ScheduleSlot,
  type TeacherScheduleBlock,
} from '../services/api'

function formatDate(value: string) {
  const d = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatScheduleDay(value: string) {
  const d = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long' })
}

function formatScheduleTime(value: string) {
  const d = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export default function Coordinador() {
  const navigate = useNavigate()
  const [auth, setAuth] = useState<{ username: string; name: string; role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const [teachers, setTeachers] = useState<CoordinatorTeacher[]>([])
  const [teacherId, setTeacherId] = useState<number>(0)
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [blocks, setBlocks] = useState<TeacherScheduleBlock[]>([])
  const [docs, setDocs] = useState<ClassStructureDoc[]>([])

  const [slotForm, setSlotForm] = useState({
    datetime: '',
    tipo: 'clase',
    modalidad: 'virtual',
    duration_minutes: 60,
    curso: 'Inglés',
    nivel: '',
    meeting_link: '',
    max_alumnos: 1,
    repeat_days: ['1', '2', '3', '4', '5'],
    repeat_until: '',
    repeat_weeks: 1,
  })
  const [blockForm, setBlockForm] = useState({ starts_at: '', ends_at: '', reason: '' })
  const [docForm, setDocForm] = useState<ClassStructureDoc>({ title: '', pdf_url: '', is_published: true, display_order: 0 })
  const [editingDocId, setEditingDocId] = useState<number | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  async function loadTeachers() {
    const list = await getCoordinatorTeachers()
    setTeachers(list)
    if (list.length > 0 && !teacherId) setTeacherId(list[0].id)
  }

  async function loadTeacherData(id: number) {
    if (!id) return
    const [slotData, blockData] = await Promise.all([
      getCoordinatorTeacherSlots(id),
      getCoordinatorBlocks(id),
    ])
    setSlots(slotData)
    setBlocks(blockData)
  }

  async function loadDocs() {
    const items = await getAdminClassStructureDocs()
    setDocs(items)
  }

  useEffect(() => {
    ;(async () => {
      try {
        const u = await me()
        if (!u || (u.role !== 'coordinator' && u.role !== 'admin')) {
          setLoading(false)
          return
        }
        setAuth({ username: u.username, name: u.name, role: u.role })
        await Promise.all([loadTeachers(), loadDocs()])
      } catch {
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!teacherId) return
    loadTeacherData(teacherId).catch(() => {
      setErr('No se pudo cargar la información del profesor')
    })
  }, [teacherId])

  const repeatDays = [
    { value: '1', label: 'Lun' },
    { value: '2', label: 'Mar' },
    { value: '3', label: 'Mié' },
    { value: '4', label: 'Jue' },
    { value: '5', label: 'Vie' },
    { value: '6', label: 'Sáb' },
    { value: '7', label: 'Dom' },
  ]

  function toggleRepeatDay(day: string) {
    setSlotForm(f => {
      const previous = new Set(f.repeat_days)
      if (previous.has(day)) {
        previous.delete(day)
      } else {
        previous.add(day)
      }
      return { ...f, repeat_days: Array.from(previous).sort((a, b) => Number(a) - Number(b)) }
    })
  }

  async function createSlot() {
    setMsg('')
    setErr('')
    if (!teacherId || !slotForm.datetime) {
      setErr('Selecciona profesor y fecha/hora')
      return
    }

    const selectedRepeatDays = slotForm.repeat_days ?? []
    if (selectedRepeatDays.length > 0 && !slotForm.repeat_until) {
      setErr('Selecciona la fecha final de la repetición o desmarca los días para un solo horario')
      return
    }

    try {
      const payload = {
        teacher_id: teacherId,
        datetime: slotForm.datetime,
        tipo: slotForm.tipo,
        modalidad: slotForm.modalidad,
        duration_minutes: slotForm.duration_minutes,
        curso: slotForm.curso,
        nivel: slotForm.nivel,
        meeting_link: slotForm.meeting_link,
        max_alumnos: slotForm.max_alumnos,
        repeat_days: selectedRepeatDays,
        repeat_until: slotForm.repeat_until,
        repeat_weeks: slotForm.repeat_weeks,
      }

      const res = await createCoordinatorTeacherSlot(payload)
      const createdCount = res?.data?.created_count ?? 1
      setMsg(createdCount > 1 ? `Se crearon ${createdCount} horarios repetidos.` : 'Horario creado')
      await loadTeacherData(teacherId)
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo crear el horario')
    }
  }

  async function removeSlot(id?: number) {
    if (!id) return
    setMsg('')
    setErr('')
    try {
      await deleteCoordinatorTeacherSlot(id)
      setMsg('Horario eliminado')
      await loadTeacherData(teacherId)
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo eliminar el horario')
    }
  }

  async function updateMeetingLink(id?: number) {
    if (!id) return
    const link = prompt('Nuevo enlace de clase (Zoom/Meet/Teams):')
    if (link === null) return
    setMsg('')
    setErr('')
    try {
      await updateCoordinatorTeacherSlotMeetingLink(id, link)
      setMsg('Enlace actualizado')
      await loadTeacherData(teacherId)
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo actualizar el enlace')
    }
  }

  async function addBlock() {
    setMsg('')
    setErr('')
    if (!teacherId || !blockForm.starts_at || !blockForm.ends_at) {
      setErr('Completa inicio y fin del bloqueo')
      return
    }
    try {
      await createCoordinatorBlock({
        teacher_id: teacherId,
        starts_at: blockForm.starts_at,
        ends_at: blockForm.ends_at,
        reason: blockForm.reason,
      })
      setMsg('Bloqueo guardado')
      setBlockForm({ starts_at: '', ends_at: '', reason: '' })
      await loadTeacherData(teacherId)
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo crear el bloqueo')
    }
  }

  async function removeBlock(id: number) {
    setMsg('')
    setErr('')
    try {
      await deleteCoordinatorBlock(id)
      setMsg('Bloqueo eliminado')
      await loadTeacherData(teacherId)
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo eliminar el bloqueo')
    }
  }

  async function doLogout() {
    await apiLogout()
    navigate('/zona-estudiantes')
  }

  function resetDocForm() {
    setEditingDocId(null)
    setDocForm({ title: '', pdf_url: '', is_published: true, display_order: 0 })
  }

  async function handleUploadPdf(file: File | null) {
    if (!file) return
    setMsg('')
    setErr('')
    if (file.type !== 'application/pdf') {
      setErr('Solo se permiten archivos PDF')
      return
    }
    setUploadingPdf(true)
    try {
      const url = await uploadClassStructurePdf(file)
      setDocForm(f => ({ ...f, pdf_url: url }))
      setMsg('PDF subido correctamente')
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo subir el PDF')
    } finally {
      setUploadingPdf(false)
    }
  }

  async function saveDoc() {
    setMsg('')
    setErr('')
    if (!docForm.title.trim() || !docForm.pdf_url.trim()) {
      setErr('Completa título y sube el archivo PDF')
      return
    }
    try {
      if (editingDocId) {
        await updateClassStructureDoc({ ...docForm, id: editingDocId })
        setMsg('Documento actualizado')
      } else {
        await createClassStructureDoc(docForm)
        setMsg('Documento creado')
      }
      resetDocForm()
      await loadDocs()
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo guardar el documento')
    }
  }

  function editDoc(doc: ClassStructureDoc) {
    setEditingDocId(doc.id || null)
    setDocForm({
      title: doc.title,
      pdf_url: doc.pdf_url,
      is_published: !!doc.is_published,
      display_order: doc.display_order ?? 0,
    })
  }

  async function removeDoc(id?: number) {
    if (!id) return
    setMsg('')
    setErr('')
    try {
      await deleteClassStructureDoc(id)
      setMsg('Documento eliminado')
      if (editingDocId === id) resetDocForm()
      await loadDocs()
    } catch (e: any) {
      setErr(e?.response?.data?.error || 'No se pudo eliminar el documento')
    }
  }

  if (loading) {
    return <main className="container-padded py-16">Cargando…</main>
  }

  if (!auth) {
    return (
      <main className="container-padded py-16 text-center">
        <p className="text-lg text-brand-black/70">No autorizado. Inicia sesión como coordinador.</p>
      </main>
    )
  }

  const slotsByDay = slots.reduce<Record<string, ScheduleSlot[]>>((result, slot) => {
    const day = slot.datetime.slice(0, 10)
    result[day] = [...(result[day] || []), slot]
    return result
  }, {})

  return (
    <main className="bg-brand-beige min-h-screen py-8">
      <div className="container-padded space-y-6">
        <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-brand-purple">Panel Coordinador</h1>
              <p className="text-gray-600">Gestiona horarios de profesores y bloquea días/horas disponibles.</p>
            </div>
            <button onClick={doLogout} className="btn-secondary">Cerrar sesión</button>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <label className="block text-sm font-semibold mb-2">Profesor</label>
          <select className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-3" value={teacherId} onChange={e => setTeacherId(Number(e.target.value))}>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name || t.username}</option>)}
          </select>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Bloquear disponibilidad</h2>
            <div className="grid gap-3">
              <label className="text-sm font-semibold">Inicio</label>
              <input type="datetime-local" className="border border-gray-300 rounded-lg px-4 py-2.5" value={blockForm.starts_at} onChange={e => setBlockForm(f => ({ ...f, starts_at: e.target.value }))} />
              <label className="text-sm font-semibold">Fin</label>
              <input type="datetime-local" className="border border-gray-300 rounded-lg px-4 py-2.5" value={blockForm.ends_at} onChange={e => setBlockForm(f => ({ ...f, ends_at: e.target.value }))} />
              <label className="text-sm font-semibold">Motivo (opcional)</label>
              <input className="border border-gray-300 rounded-lg px-4 py-2.5" value={blockForm.reason} onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} placeholder="Vacaciones, reunión, incapacidad..." />
              <button onClick={addBlock} className="btn-primary">Guardar bloqueo</button>
            </div>

            <div className="mt-5 space-y-2 max-h-64 overflow-auto">
              {blocks.length === 0 ? <p className="text-sm text-gray-500">Sin bloqueos activos.</p> : blocks.map(b => (
                <div key={b.id} className="rounded-lg border border-gray-200 p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{formatDate(b.starts_at)} - {formatDate(b.ends_at)}</p>
                    {b.reason && <p className="text-xs text-gray-600">{b.reason}</p>}
                  </div>
                  <button onClick={() => removeBlock(b.id)} className="text-red-600 text-sm font-semibold">Eliminar</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Crear horario para profesor</h2>
            <div className="grid gap-3">
              <label className="text-sm font-semibold">Fecha y hora</label>
              <input type="datetime-local" className="border border-gray-300 rounded-lg px-4 py-2.5" value={slotForm.datetime} onChange={e => setSlotForm(f => ({ ...f, datetime: e.target.value }))} />

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">Repetir por días</label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-purple"
                    onClick={() => setSlotForm(f => ({ ...f, repeat_days: [] }))}
                  >
                    Limpiar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {repeatDays.map(day => {
                    const active = slotForm.repeat_days.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        className={`px-3 py-2 rounded-full text-sm font-semibold border transition ${active ? 'bg-brand-purple text-white border-brand-purple' : 'bg-white text-gray-700 border-gray-300 hover:border-brand-purple'}`}
                        onClick={() => toggleRepeatDay(day.value)}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-3 grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Hasta</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                      value={slotForm.repeat_until}
                      onChange={e => setSlotForm(f => ({ ...f, repeat_until: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cada N semanas</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                      value={slotForm.repeat_weeks}
                      onChange={e => setSlotForm(f => ({ ...f, repeat_weeks: Number(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select className="border border-gray-300 rounded-lg px-4 py-2.5" value={slotForm.tipo} onChange={e => setSlotForm(f => ({ ...f, tipo: e.target.value }))}>
                  <option value="clase">Clase</option>
                  <option value="examen">Examen</option>
                </select>
                <select className="border border-gray-300 rounded-lg px-4 py-2.5" value={slotForm.modalidad} onChange={e => setSlotForm(f => ({ ...f, modalidad: e.target.value }))}>
                  <option value="virtual">Virtual</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Curso" value={slotForm.curso} onChange={e => setSlotForm(f => ({ ...f, curso: e.target.value }))} />
                <input className="border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Nivel (A1, B2...)" value={slotForm.nivel} onChange={e => setSlotForm(f => ({ ...f, nivel: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min={15} className="border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Duración (min)" value={slotForm.duration_minutes} onChange={e => setSlotForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))} />
                <input type="number" min={1} className="border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Máx alumnos" value={slotForm.max_alumnos} onChange={e => setSlotForm(f => ({ ...f, max_alumnos: Number(e.target.value) }))} />
              </div>
              <input className="border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Enlace de clase (opcional)" value={slotForm.meeting_link} onChange={e => setSlotForm(f => ({ ...f, meeting_link: e.target.value }))} />
              <button onClick={createSlot} className="btn-primary">Crear horario</button>
            </div>
          </div>
        </section>

        {(msg || err) && (
          <section className={`rounded-xl p-4 border ${err ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
            {err || msg}
          </section>
        )}

        <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Horarios del profesor seleccionado</h2>
          {slots.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <div className="flex gap-4 min-w-max pb-2">
                {Object.entries(slotsByDay).map(([day, daySlots]) => (
                  <div key={day} className="w-64 shrink-0 rounded-xl border border-brand-purple/20 bg-brand-beige/40 overflow-hidden">
                    <div className="bg-brand-purple px-4 py-3 text-white">
                      <p className="text-xs uppercase font-semibold opacity-80">Agenda</p>
                      <p className="font-bold capitalize">{formatScheduleDay(day)}</p>
                    </div>
                    <div className="p-3 space-y-2">
                      {daySlots.map(slot => (
                        <div key={slot.id} className="bg-white border-l-4 border-brand-orange rounded-lg px-3 py-2 shadow-sm">
                          <p className="font-extrabold text-brand-purple">{formatScheduleTime(slot.datetime)}</p>
                          <p className="text-sm font-semibold text-gray-800">{slot.curso || 'Clase'} {slot.nivel ? `· ${slot.nivel}` : ''}</p>
                          <p className="text-xs text-gray-500 capitalize">{slot.tipo} · {slot.modalidad} · {slot.duration_minutes || 60} min</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Modalidad</th>
                  <th className="py-2">Curso</th>
                  <th className="py-2">Cupos</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(s => (
                  <tr key={s.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4">{formatDate(s.datetime)}</td>
                    <td className="py-2 pr-4">{s.tipo}</td>
                    <td className="py-2 pr-4">{s.modalidad}</td>
                    <td className="py-2 pr-4">{s.curso || '-'}</td>
                    <td className="py-2 pr-4">{s.max_alumnos || 1}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button className="text-brand-purple font-semibold" onClick={() => updateMeetingLink(s.id)}>Enlace</button>
                        <button className="text-red-600 font-semibold" onClick={() => removeSlot(s.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {slots.length === 0 && <p className="text-sm text-gray-500 mt-3">No hay horarios creados.</p>}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Estructura de clases (PDF)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Estos documentos se muestran al profesor en modo visualización embebida, sin botón de descarga en la plataforma.
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="grid gap-3">
              <input
                className="border border-gray-300 rounded-lg px-4 py-2.5"
                placeholder="Título del documento"
                value={docForm.title}
                onChange={e => setDocForm(f => ({ ...f, title: e.target.value }))}
              />
              <div>
                <label className="text-sm font-semibold block mb-1">Archivo PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="border border-gray-300 rounded-lg px-4 py-2.5 w-full"
                  onChange={e => handleUploadPdf(e.target.files?.[0] || null)}
                  disabled={uploadingPdf}
                />
                {uploadingPdf && <p className="text-xs text-brand-purple mt-1">Subiendo PDF…</p>}
                {docForm.pdf_url && (
                  <p className="text-xs text-gray-500 mt-1 break-all">Archivo: {docForm.pdf_url}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg px-4 py-2.5"
                  placeholder="Orden"
                  value={docForm.display_order ?? 0}
                  onChange={e => setDocForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                />
                <label className="border border-gray-300 rounded-lg px-4 py-2.5 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!docForm.is_published}
                    onChange={e => setDocForm(f => ({ ...f, is_published: e.target.checked }))}
                  />
                  Publicado
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={saveDoc} disabled={uploadingPdf} className="btn-primary disabled:opacity-50">{editingDocId ? 'Actualizar PDF' : 'Crear PDF'}</button>
                {editingDocId && (
                  <button onClick={resetDocForm} className="btn-secondary">Cancelar edición</button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-auto">
              {docs.length === 0 ? (
                <p className="text-sm text-gray-500">No hay PDFs configurados.</p>
              ) : (
                docs.map(d => (
                  <div key={d.id} className="rounded-lg border border-gray-200 p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{d.title}</p>
                      <p className="text-xs text-gray-500 break-all">{d.pdf_url}</p>
                      <p className="text-xs text-gray-600 mt-1">Orden: {d.display_order ?? 0} · {d.is_published ? 'Publicado' : 'Oculto'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-brand-purple text-sm font-semibold" onClick={() => editDoc(d)}>Editar</button>
                      <button className="text-red-600 text-sm font-semibold" onClick={() => removeDoc(d.id)}>Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
