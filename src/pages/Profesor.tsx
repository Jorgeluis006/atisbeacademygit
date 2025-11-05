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
    const confirmed = confirm('⚠️ ¿Estás seguro de eliminar este horario?\n\nNota: Si hay estudiantes reservados en este horario, no podrás eliminarlo.')
    if (!confirmed) return
    
    try {
      await deleteTeacherSlot(id)
      const updated = await getTeacherSlots()
      setSlots(updated)
      alert('✅ Horario eliminado exitosamente')
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || 'No se pudo eliminar'
      
      if (errorMsg.includes('reservas activas') || errorMsg.includes('reservas')) {
        alert('❌ No se puede eliminar este horario\n\n📌 Razón: Hay estudiantes que ya lo reservaron.\n\n💡 Sugerencia: Cancela primero las reservas de los estudiantes o espera a que termine la clase.')
      } else {
        alert('❌ Error al eliminar: ' + errorMsg)
      }
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
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl p-8 shadow-2xl border-2 border-purple-200 mt-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">📅</span>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
            Gestión de horarios
          </h2>
        </div>
        <p className="text-sm text-gray-600 mb-6 flex items-center gap-2">
          <span className="text-lg">✨</span>
          Crea horarios disponibles para que tus estudiantes los reserven.
        </p>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-200 mb-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-base">🕐</span>
                Fecha y hora
              </label>
              <input 
                type="datetime-local" 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-brand-purple transition-all shadow-sm hover:border-purple-400" 
                value={newSlot.datetime} 
                onChange={e => setNewSlot({ ...newSlot, datetime: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-base">📚</span>
                Tipo
              </label>
              <select className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm hover:border-blue-400 font-semibold" value={newSlot.tipo} onChange={e => setNewSlot({ ...newSlot, tipo: e.target.value })}>
                <option value="clase">📖 Clase</option>
                <option value="examen">📝 Examen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-base">💻</span>
                Modalidad
              </label>
              <select className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all shadow-sm hover:border-green-400 font-semibold" value={newSlot.modalidad} onChange={e => setNewSlot({ ...newSlot, modalidad: e.target.value })}>
                <option value="virtual">🌐 Virtual</option>
                <option value="presencial">🏫 Presencial</option>
              </select>
            </div>
            <div>
              <button 
                className="btn-primary w-full h-12 font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2" 
                disabled={creatingSlot || !newSlot.datetime} 
                onClick={handleCreateSlot}
              >
                {creatingSlot ? (
                  <>
                    <span className="animate-spin">⏳</span> Creando...
                  </>
                ) : (
                  <>
                    <span>➕</span> Crear horario
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {slots.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 text-center border-2 border-dashed border-purple-300">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 font-semibold">No tienes horarios creados aún.</p>
            <p className="text-sm text-gray-500 mt-2">¡Crea tu primer horario arriba!</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-purple-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-brand-purple to-purple-600 text-white">
                  <th className="px-6 py-4 text-left font-bold border-r border-white/20">
                    <div className="flex items-center gap-2">
                      <span>📅</span> Fecha y hora
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-bold border-r border-white/20">
                    <div className="flex items-center gap-2">
                      <span>📚</span> Tipo
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-bold border-r border-white/20">
                    <div className="flex items-center gap-2">
                      <span>💻</span> Modalidad
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-bold border-r border-white/20">
                    <div className="flex items-center gap-2">
                      <span>⏱️</span> Duración
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-bold border-r border-white/20">
                    <div className="flex items-center gap-2">
                      <span>✅</span> Estado
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-bold">
                    <div className="flex items-center gap-2">
                      <span>⚙️</span> Acciones
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot, index) => {
                  const dt = new Date(slot.datetime)
                  const isEven = index % 2 === 0
                  return (
                    <tr key={slot.id} className={`border-b border-gray-200 hover:bg-purple-50 transition-colors ${isEven ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <td className="px-6 py-4 font-semibold text-gray-800">{dt.toLocaleString('es-ES')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold shadow-sm ${
                          slot.tipo === 'examen' 
                            ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300' 
                            : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border border-blue-300'
                        }`}>
                          <span>{slot.tipo === 'examen' ? '📝' : '📖'}</span>
                          {slot.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold shadow-sm ${
                          slot.modalidad === 'virtual' 
                            ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border border-purple-300' 
                            : 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-300'
                        }`}>
                          <span>{slot.modalidad === 'virtual' ? '🌐' : '🏫'}</span>
                          {slot.modalidad}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">
                        <span className="flex items-center gap-1">
                          ⏱️ {slot.duration_minutes || 60} min
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-300 shadow-sm">
                          <span>✅</span> Disponible
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2" 
                          onClick={() => handleDeleteSlot(slot.id!)}
                        >
                          <span>🗑️</span> Eliminar
                        </button>
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
          <>
            {/* Horario tipo calendario mejorado */}
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-[900px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
                {/* Header con días de la semana */}
                <div className="grid grid-cols-8 bg-gradient-to-r from-brand-purple via-purple-600 to-brand-pink shadow-lg">
                  <div className="p-4 text-center text-white font-extrabold text-sm border-r border-white/30 bg-purple-800/50">
                    <div className="text-xs opacity-80 mb-1">📅</div>
                    <div>HORA</div>
                  </div>
                  {(() => {
                    // Encontrar la fecha mínima de las reservas o usar hoy
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    let startDate = new Date(today)
                    if (reservations.length > 0) {
                      const reservationDates = reservations.map(r => new Date(r.datetime))
                      const minDate = new Date(Math.min(...reservationDates.map(d => d.getTime())))
                      minDate.setHours(0, 0, 0, 0)
                      
                      // Usar la menor entre hoy y la fecha de la primera reserva
                      if (minDate < today) {
                        startDate = minDate
                      }
                    }
                    
                    // Calcular el inicio de la semana (domingo)
                    const startOfWeek = new Date(startDate)
                    startOfWeek.setDate(startDate.getDate() - startDate.getDay())
                    
                    const daysConfig = [
                      { name: 'DOMINGO', emoji: '📕', dayOfWeek: 0 },
                      { name: 'LUNES', emoji: '📚', dayOfWeek: 1 },
                      { name: 'MARTES', emoji: '📖', dayOfWeek: 2 },
                      { name: 'MIÉRCOLES', emoji: '✏️', dayOfWeek: 3 },
                      { name: 'JUEVES', emoji: '📝', dayOfWeek: 4 },
                      { name: 'VIERNES', emoji: '🎓', dayOfWeek: 5 },
                      { name: 'SÁBADO', emoji: '📔', dayOfWeek: 6 }
                    ]
                    
                    // Calcular la fecha exacta para cada día de la semana
                    return daysConfig.map((day) => {
                      const date = new Date(startOfWeek)
                      date.setDate(startOfWeek.getDate() + day.dayOfWeek)
                      const dayNumber = date.getDate()
                      const monthName = date.toLocaleDateString('es-ES', { month: 'short' })
                      const fullDate = date.toISOString().split('T')[0] // YYYY-MM-DD
                      
                      return (
                        <div key={day.name} className="p-4 text-center text-white font-extrabold text-sm border-r border-white/30 last:border-r-0" data-date={fullDate}>
                          <div className="text-xs opacity-80 mb-1">{day.emoji}</div>
                          <div>{day.name}</div>
                          <div className="text-lg font-bold mt-1">{dayNumber}</div>
                          <div className="text-xs opacity-90">{monthName}</div>
                        </div>
                      )
                    })
                  })()}
                </div>
                
                {/* Filas de horas */}
                {Array.from({ length: 14 }, (_, i) => i + 6).map((hour) => {
                  // Calcular fechas de la semana para comparación
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  
                  let startDate = new Date(today)
                  if (reservations.length > 0) {
                    const reservationDates = reservations.map(r => new Date(r.datetime))
                    const minDate = new Date(Math.min(...reservationDates.map(d => d.getTime())))
                    minDate.setHours(0, 0, 0, 0)
                    if (minDate < today) {
                      startDate = minDate
                    }
                  }
                  
                  const startOfWeek = new Date(startDate)
                  startOfWeek.setDate(startDate.getDate() - startDate.getDay())
                  
                  // Obtener reservas para esta hora y día específico
                  const getReservationsForHourAndDay = (dayOfWeek: number) => {
                    const targetDate = new Date(startOfWeek)
                    targetDate.setDate(startOfWeek.getDate() + dayOfWeek)
                    const targetDateStr = targetDate.toISOString().split('T')[0]
                    
                    return reservations.filter(res => {
                      const dt = new Date(res.datetime)
                      const resDateStr = dt.toISOString().split('T')[0]
                      return dt.getHours() === hour && resDateStr === targetDateStr
                    })
                  }

                  const isEvenHour = hour % 2 === 0

                  return (
                    <div key={hour} className={`grid grid-cols-8 border-t-2 ${isEvenHour ? 'border-purple-200' : 'border-blue-200'}`}>
                      {/* Columna de hora */}
                      <div className={`p-4 text-center font-bold border-r-2 border-purple-200 ${
                        isEvenHour 
                          ? 'bg-gradient-to-r from-purple-100 to-purple-50' 
                          : 'bg-gradient-to-r from-blue-100 to-blue-50'
                      }`}>
                        <div className="text-2xl font-extrabold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="text-xs text-gray-600 font-semibold mt-1">
                          {hour < 12 ? 'a.m.' : 'p.m.'}
                        </div>
                      </div>
                      
                      {/* Columnas para cada día */}
                      {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                        const dayReservations = getReservationsForHourAndDay(dayOfWeek)
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                        
                        return (
                          <div 
                            key={dayOfWeek} 
                            className={`p-2 border-r-2 last:border-r-0 min-h-[80px] transition-all duration-200 ${
                              isWeekend 
                                ? 'border-purple-200 bg-purple-50/30 hover:bg-purple-100/50' 
                                : 'border-blue-200 bg-white/50 hover:bg-blue-50/50'
                            } ${dayReservations.length > 0 ? 'shadow-inner' : ''}`}
                          >
                            {dayReservations.length === 0 ? (
                              <div className="h-full flex items-center justify-center opacity-20">
                                <span className="text-2xl">·</span>
                              </div>
                            ) : (
                              dayReservations.map((res) => {
                                const resDateTime = new Date(res.datetime)
                                const timeStr = resDateTime.toLocaleTimeString('es-ES', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: true 
                                })
                                
                                return (
                                <div
                                  key={res.id}
                                  className={`text-xs p-3 rounded-xl mb-2 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
                                    res.tipo === 'examen' 
                                      ? 'bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400 hover:from-red-200 hover:to-red-300' 
                                      : 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-400 hover:from-blue-200 hover:to-blue-300'
                                  }`}
                                >
                                  {/* Hora exacta */}
                                  <div className="text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                    <span>🕐</span>
                                    <span>{timeStr}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-base">{res.tipo === 'examen' ? '📝' : '📚'}</span>
                                    <div className="font-bold text-gray-900 truncate flex-1 text-sm">
                                      {res.student_name || res.student_username}
                                    </div>
                                  </div>
                                  <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-block ${
                                    res.modalidad === 'virtual' ? 'bg-purple-500 text-white' :
                                    res.modalidad === 'presencial' ? 'bg-green-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    {res.modalidad}
                                  </div>
                                  {res.notas && (
                                    <div className="text-gray-700 text-xs mt-2 p-2 bg-white/60 rounded backdrop-blur-sm">
                                      💬 {res.notas}
                                    </div>
                                  )}
                                </div>
                                )
                              })
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tabla tradicional (opcional, debajo del calendario) */}
            <details className="mt-6">
              <summary className="cursor-pointer text-brand-purple font-semibold hover:underline">
                Ver lista detallada
              </summary>
              <div className="overflow-x-auto mt-4">
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
            </details>
          </>
        )}
      </section>

      {/* Editor de progreso */}
      <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl p-8 shadow-2xl border-2 border-purple-200 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl">📊</span>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
            Editar progreso del estudiante
          </h2>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-200 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <span className="text-base">👤</span>
                Selecciona estudiante
              </label>
              <select 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-brand-purple transition-all shadow-sm hover:border-purple-400 font-semibold" 
                value={selStudent} 
                onChange={async (e) => {
                  const u = e.target.value; setSelStudent(u); setProg(null)
                  if (u) {
                    try { const res = await getStudentProgressFor(u); setProg(res.progreso) } catch {}
                  }
                }}
              >
                <option value="">— Seleccionar —</option>
                {allStudents.map(s => <option key={s.username} value={s.username}>👨‍🎓 {s.username}{s.name ? ` — ${s.name}` : ''}</option>)}
              </select>
            </div>
            <div>
              <button 
                className="btn-primary w-full h-12 font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2" 
                disabled={!selStudent || !prog || saving} 
                onClick={async () => {
                  if (!selStudent || !prog) return; setSaving(true)
                  try { 
                    await saveStudentProgress({ student_username: selStudent, progreso: prog }); 
                    
                    // Recargar grupos de estudiantes para reflejar cambios de nivel
                    const gs = await getTeacherStudents()
                    setGroups(gs)
                    
                    // Actualizar lista aplanada de estudiantes
                    const flat: { username: string; name?: string }[] = []
                    Object.keys(gs).forEach(k => {
                      const g = gs[k] as { virtual: any[]; presencial: any[]; ['sin-definir']: any[] }
                      ;(['virtual','presencial','sin-definir'] as const).forEach(mod => {
                        (g?.[mod] || []).forEach((s: any) => flat.push({ username: s.username, name: s.name }))
                      })
                    })
                    setAllStudents(flat)
                    
                    alert('✅ Progreso actualizado exitosamente'); 
                  }
                  catch { alert('❌ No se pudo guardar'); }
                  finally { setSaving(false) }
                }}
              >
                {saving ? (
                  <>
                    <span className="animate-spin">⏳</span> Guardando…
                  </>
                ) : (
                  <>
                    <span>💾</span> Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {prog && (
          <div className="space-y-6">
            {/* Asistencia y Nivel */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-base">📈</span>
                    Asistencia (%)
                  </label>
                  <input 
                    type="number" 
                    min={0} 
                    max={100} 
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm hover:border-blue-400 font-bold text-lg" 
                    value={prog.asistencia} 
                    onChange={e => setProg({ ...prog, asistencia: Math.max(0, Math.min(100, Number(e.target.value)||0)) })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    Nivel (MCER)
                  </label>
                  <select 
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all shadow-sm hover:border-green-400 font-bold text-lg" 
                    value={prog.nivel.mcer} 
                    onChange={e => setProg({ ...prog, nivel: { ...prog.nivel, mcer: e.target.value } })}
                  >
                    <option value="">— Seleccionar nivel —</option>
                    {['A1','A2','B1','B2','C1','C2'].map(n => <option key={n} value={n}>📚 {n}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="text-base">📝</span>
                  Descripción nivel
                </label>
                <textarea 
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-brand-purple transition-all shadow-sm hover:border-purple-400" 
                  rows={3} 
                  value={prog.nivel.descripcion} 
                  onChange={e => setProg({ ...prog, nivel: { ...prog.nivel, descripcion: e.target.value } })} 
                />
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200">
              <label className="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Notas
              </label>
              <div className="space-y-3">
                {prog.notas.length === 0 && (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-gray-600 font-semibold">Aún no hay notas. Agrega la primera.</p>
                  </div>
                )}
                {prog.notas.map((n, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200 shadow-sm">
                    <div className="grid sm:grid-cols-[1fr_110px_170px_auto] gap-3">
                      <input 
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 font-semibold" 
                        placeholder="📖 Actividad" 
                        value={n.actividad} 
                        onChange={e => updateNote(idx, { actividad: e.target.value })} 
                      />
                      <input 
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 font-bold text-center" 
                        type="number" 
                        step={0.1} 
                        min={0} 
                        max={5} 
                        placeholder="⭐ Nota" 
                        value={Number.isFinite(n.nota) ? n.nota : 0} 
                        onChange={e => updateNote(idx, { nota: Math.max(0, Math.min(5, Number(e.target.value)||0)) })} 
                      />
                      <input 
                        className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-semibold" 
                        type="date" 
                        value={n.fecha || ''} 
                        onChange={e => updateNote(idx, { fecha: e.target.value })} 
                      />
                      <button 
                        type="button" 
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2" 
                        onClick={() => removeNote(idx)}
                      >
                        <span>🗑️</span>
                        <span className="hidden sm:inline">Eliminar</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2" 
                  onClick={addNote}
                >
                  <span className="text-xl">➕</span> Añadir nota
                </button>
              </div>
            </div>

            {/* Fortalezas y Debilidades */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border-2 border-green-300">
                <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  Fortalezas
                </label>
                <p className="text-xs text-gray-600 mb-2">Separadas por coma</p>
                <textarea 
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 focus:border-green-500 transition-all shadow-sm" 
                  rows={5} 
                  placeholder="Ejemplo: Pronunciación, Gramática, Vocabulario..." 
                  value={prog.fortalezas.join(', ')} 
                  onChange={e => setProg({ ...prog, fortalezas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                />
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-lg border-2 border-orange-300">
                <label className="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📌</span>
                  Debilidades
                </label>
                <p className="text-xs text-gray-600 mb-2">Separadas por coma</p>
                <textarea 
                  className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 transition-all shadow-sm" 
                  rows={5} 
                  placeholder="Ejemplo: Tiempos verbales, Listening, Speaking..." 
                  value={prog.debilidades.join(', ')} 
                  onChange={e => setProg({ ...prog, debilidades: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Lista de estudiantes agrupados */}
      {levels.length === 0 ? (
        <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-3">👥</div>
          <p className="text-lg font-semibold text-gray-600">Aún no tienes estudiantes asignados.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {levels.map(level => {
            const allStudents = [
              ...(groups[level]?.virtual || []),
              ...(groups[level]?.presencial || []),
              ...(groups[level]?.['sin-definir'] || [])
            ]
            
            return (
              <section key={level} className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-indigo-200">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">📚</span>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Nivel {level}
                  </h2>
                  <span className="ml-auto bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    {allStudents.length} {allStudents.length === 1 ? 'estudiante' : 'estudiantes'}
                  </span>
                </div>
                
                {allStudents.length === 0 ? (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-indigo-200">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-sm text-gray-600 font-semibold">Sin estudiantes en este nivel</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {allStudents.map((s) => (
                      <div key={s.id} className="bg-white rounded-xl p-4 shadow-lg border border-indigo-200 hover:shadow-xl hover:scale-105 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {(s.name || s.username).substring(0,1).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate">{s.name || s.username}</div>
                            <div className="text-gray-500 text-xs truncate">👤 {s.username}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}