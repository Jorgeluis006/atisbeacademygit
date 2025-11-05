import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, logout as apiLogout, me as apiMe, getStudentProgress, type StudentProgress, getScheduleSlots, createReservation, getMyReservations, cancelReservation, type ScheduleSlot, type Reservation } from '../services/api'

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await apiLogin(username, email, password)
      onSuccess()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} method="post" action="#" id="login-form" className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Ingreso de estudiantes</h2>
      
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Correo electrónico</label>
      <input 
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
        placeholder="tu@correo.com" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required
      />
      
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="username">Usuario</label>
      <input 
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
        placeholder="Tu usuario" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} 
        required
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
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
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
            <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📊</span>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">Progreso</h2>
              </div>
              {!progress ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-200">
                  <div className="animate-spin text-4xl mb-2">⏳</div>
                  <p className="text-sm text-gray-600 font-semibold">Cargando progreso…</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Asistencia */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="text-xl">📈</span> Asistencia
                      </span>
                      <span className="text-2xl font-extrabold text-blue-600">{progress.asistencia}%</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progress.asistencia}%` }}
                      />
                    </div>
                  </div>

                  {/* Nivel MCER */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🎯</span>
                      <span className="font-bold text-gray-800">Nivel (MCER)</span>
                    </div>
                    <div className="text-3xl font-extrabold text-green-600 mb-2">📚 {progress.nivel.mcer}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{progress.nivel.descripcion}</p>
                  </div>

                  {/* Notas */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📋</span>
                      <span className="font-bold text-gray-800">Notas</span>
                    </div>
                    {progress.notas.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-1">📭</div>
                        <p className="text-xs text-gray-600">Sin notas aún</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {progress.notas.map((n, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-gray-800 text-sm">📖 {n.actividad}</span>
                              <span className="text-lg font-bold text-green-600">⭐ {n.nota}</span>
                            </div>
                            <span className="text-xs text-gray-600">📅 {n.fecha}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fortalezas */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💪</span>
                      <span className="font-bold text-gray-800">Fortalezas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {progress.fortalezas.length === 0 ? (
                        <span className="text-sm text-gray-600">Sin fortalezas registradas</span>
                      ) : (
                        progress.fortalezas.map((f, idx) => (
                          <span key={idx} className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            ✨ {f}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Debilidades */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-md border-2 border-orange-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📌</span>
                      <span className="font-bold text-gray-800">Áreas de mejora</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {progress.debilidades.length === 0 ? (
                        <span className="text-sm text-gray-600">Sin áreas de mejora registradas</span>
                      ) : (
                        progress.debilidades.map((d, idx) => (
                          <span key={idx} className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            🎯 {d}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
            
            <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 shadow-xl border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📅</span>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Horarios / Agendar</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Agenda clases personalizadas y exámenes.</p>
              <ScheduleSection slots={slots} reservas={reservas} onBooked={async () => setReservas(await getMyReservations())} onCancel={async () => setReservas(await getMyReservations())} />
            </section>
            
            <section className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-2xl p-6 shadow-xl border-2 border-purple-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🐾</span>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Mascota MCER</h2>
              </div>
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-brand-purple via-pink-400 to-brand-amber shadow-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl animate-bounce">🦊</span>
                </div>
              </div>
              <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-200">
                <p className="text-sm font-semibold text-gray-700">Tu mascota está creciendo 🌱</p>
                <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </section>
          </div>
          )}
        </>
      )}
      </div>
    </main>
  )
}

// Helper function to parse MySQL datetime as local time (not UTC)
function parseLocalDateTime(mysqlDatetime: string): Date {
  if (!mysqlDatetime) {
    return new Date()
  }
  
  // MySQL datetime format: "2025-11-05 20:54:00"
  const [datePart, timePart = '00:00:00'] = mysqlDatetime.split(' ')
  const [year, month, day] = datePart.split('-')
  const [hour, minute, second] = timePart.split(':')
  
  // Create date with local timezone
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // months are 0-indexed
    parseInt(day),
    parseInt(hour || '0'),
    parseInt(minute || '0'),
    parseInt(second || '0')
  )
}

function ScheduleSection({ slots, reservas, onBooked, onCancel }: { slots: ScheduleSlot[]; reservas: Reservation[]; onBooked: () => void; onCancel: () => void }) {
  const [selected, setSelected] = useState<ScheduleSlot | null>(null)
  const [notas, setNotas] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [modalidadFilter, setModalidadFilter] = useState<'todas' | 'virtual' | 'presencial'>('todas')

  // Filtrar slots por modalidad
  const filteredSlots = modalidadFilter === 'todas' 
    ? slots 
    : slots.filter(s => s.modalidad === modalidadFilter)

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
      {/* Filtros de modalidad */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-bold text-gray-800">Filtrar por modalidad:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setModalidadFilter('todas')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              modalidadFilter === 'todas'
                ? 'bg-gradient-to-r from-brand-purple to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            📚 Todas ({slots.length})
          </button>
          <button
            onClick={() => setModalidadFilter('virtual')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              modalidadFilter === 'virtual'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 border-purple-300 hover:border-purple-500 hover:shadow-md'
            }`}
          >
            🌐 Virtual ({slots.filter(s => s.modalidad === 'virtual').length})
          </button>
          <button
            onClick={() => setModalidadFilter('presencial')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              modalidadFilter === 'presencial'
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md'
            }`}
          >
            🏫 Presencial ({slots.filter(s => s.modalidad === 'presencial').length})
          </button>
        </div>
      </div>

      {/* Selector de horario */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-blue-200 shadow-md mb-4">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span>🕐</span> Selecciona un horario
            </label>
            <select 
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all shadow-sm hover:border-blue-400 font-semibold" 
              value={selected?.id || ''} 
              onChange={(e) => {
                const slot = filteredSlots.find(s => s.id === Number(e.target.value))
                setSelected(slot || null)
              }}
            >
              <option value="">Selecciona un horario</option>
              {filteredSlots.map((s) => {
                const dateTime = parseLocalDateTime(s.datetime)
                const formattedDate = dateTime.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })
                const formattedTime = dateTime.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })
                
                const cursoInfo = s.curso ? ` - ${s.curso}` : ''
                const nivelInfo = s.nivel ? ` [${s.nivel}]` : ''
                
                return (
                  <option key={s.id} value={s.id}>
                    {formattedDate}, {formattedTime} - {s.tipo} ({s.modalidad}){cursoInfo}{nivelInfo}
                  </option>
                )
              })}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span>📝</span> Notas (opcional)
            </label>
            <input 
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all shadow-sm hover:border-purple-400" 
              placeholder="Escribe tus notas aquí..." 
              value={notas} 
              onChange={(e) => setNotas(e.target.value)} 
            />
          </div>
        </div>
        
        <div className="mt-5 flex items-center gap-3">
          <button 
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            disabled={loading || !selected} 
            onClick={reservar}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span> Procesando…
              </>
            ) : (
              <>
                <span>✅</span> Agendar
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-xl p-3 flex items-center gap-2">
            <span className="text-xl">❌</span>
            <span className="text-red-700 text-sm font-semibold">{error}</span>
          </div>
        )}
        {ok && (
          <div className="mt-3 bg-green-50 border-2 border-green-300 rounded-xl p-3 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="text-green-700 text-sm font-semibold">{ok}</span>
          </div>
        )}
      </div>

      {/* Mis reservas */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📋</span>
          <h3 className="text-xl font-bold text-gray-800">Mis reservas</h3>
        </div>
        
        {reservas.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center border border-indigo-200">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm text-gray-600 font-semibold">Aún no tienes reservas.</p>
            <p className="text-xs text-gray-500 mt-1">Agenda tu primera clase arriba 👆</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservas.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-lg border border-indigo-200 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        r.tipo === 'clase' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {r.tipo === 'clase' ? '📚 Clase' : '📝 Examen'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        r.modalidad === 'virtual' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {r.modalidad === 'virtual' ? '🌐 Virtual' : '🏫 Presencial'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <span>🕐</span> {parseLocalDateTime(r.datetime).toLocaleString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    {r.notas && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <span className="text-xs text-gray-500 font-semibold">📝 Notas:</span>
                        <p className="text-sm text-gray-700 mt-1">{r.notas}</p>
                      </div>
                    )}
                  </div>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center gap-1" 
                    disabled={loading} 
                    onClick={() => cancelar(r.id)}
                  >
                    <span>🗑️</span> Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
