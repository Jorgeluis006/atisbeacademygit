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
            <>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
            <section className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">Progreso</h2>
              </div>
              {!progress ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-purple-200">
                  <svg className="animate-spin w-10 h-10 mx-auto mb-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-sm text-gray-600 font-semibold">Cargando progreso…</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Asistencia */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Asistencia
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

                  {/* Tipo de Curso */}
                  {progress.curso && (
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 shadow-md border-2 border-indigo-300">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="font-bold text-gray-800">Tipo de Curso</span>
                      </div>
                      <div className="text-2xl font-extrabold text-indigo-600">{progress.curso}</div>
                    </div>
                  )}

                  {/* Nivel MCER */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span className="font-bold text-gray-800">Nivel (MCER)</span>
                    </div>
                    <div className="text-3xl font-extrabold text-green-600 mb-2">{progress.nivel.mcer}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{progress.nivel.descripcion}</p>
                  </div>

                  {/* Notas */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-bold text-gray-800">Notas</span>
                    </div>
                    {progress.notas.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <svg className="w-8 h-8 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-xs text-gray-600">Sin notas aún</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {progress.notas.map((n, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                {n.actividad}
                              </span>
                              <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {n.nota}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {n.fecha}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fortalezas */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-md border-2 border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-gray-800">Fortalezas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {progress.fortalezas.length === 0 ? (
                        <span className="text-sm text-gray-600">Sin fortalezas registradas</span>
                      ) : (
                        progress.fortalezas.map((f, idx) => (
                          <span key={idx} className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {f}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Debilidades */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-md border-2 border-orange-300">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-bold text-gray-800">Áreas de mejora</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {progress.debilidades.length === 0 ? (
                        <span className="text-sm text-gray-600">Sin áreas de mejora registradas</span>
                      ) : (
                        progress.debilidades.map((d, idx) => (
                          <span key={idx} className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {d}
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
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Horarios / Agendar</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Agenda clases personalizadas y exámenes.</p>
              <ScheduleSection slots={slots} reservas={reservas} onBooked={async () => setReservas(await getMyReservations())} onCancel={async () => setReservas(await getMyReservations())} />
            </section>
            
            <section className="bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-2xl p-6 shadow-xl border-2 border-purple-300">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Mascota MCER</h2>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {progress?.nivel?.mcer && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(progress.nivel.mcer) ? (
                    <img 
                      src={`/images/${progress.nivel.mcer}.png`} 
                      alt={`Mascota nivel ${progress.nivel.mcer}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img 
                      src="/images/Mascota[1].png" 
                      alt="Mascota por defecto"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
              <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-200">
                <p className="text-sm font-semibold text-gray-700">
                  {progress?.nivel?.mcer ? `Nivel ${progress.nivel.mcer} - Tu mascota está creciendo 🌱` : 'Tu mascota está creciendo 🌱'}
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" style={{ 
                    width: progress?.nivel?.mcer ? 
                      (progress.nivel.mcer === 'A1' ? '20%' : 
                       progress.nivel.mcer === 'A2' ? '35%' :
                       progress.nivel.mcer === 'B1' ? '50%' :
                       progress.nivel.mcer === 'B2' ? '65%' :
                       progress.nivel.mcer === 'C1' ? '85%' : 
                       progress.nivel.mcer === 'C2' ? '100%' : '10%') 
                      : '10%' 
                  }} />
                </div>
              </div>
            </section>
          </div>

          {/* Calendario Semanal - Abajo de todo */}
          <section className="mt-6 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Mis Clases - Vista Semanal</h2>
            </div>
            
            {reservas.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center border border-purple-200">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 font-semibold">Aún no tienes clases agendadas</p>
                <p className="text-xs text-gray-500 mt-1">Agenda tu primera clase en la sección de arriba 👆</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-[900px] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
                  {/* Header con días de la semana */}
                  <div className="grid grid-cols-8 bg-gradient-to-r from-brand-purple via-purple-600 to-brand-pink shadow-lg">
                    <div className="p-4 text-center text-white font-extrabold text-sm border-r border-white/30 bg-purple-800/50">
                      <div className="flex items-center justify-center mb-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>HORA</div>
                    </div>
                    {(() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      
                      let startDate = new Date(today)
                      if (reservas.length > 0) {
                        const reservationDates = reservas.map(r => parseLocalDateTime(r.datetime))
                        const minDate = new Date(Math.min(...reservationDates.map(d => d.getTime())))
                        minDate.setHours(0, 0, 0, 0)
                        
                        if (minDate < today) {
                          startDate = minDate
                        }
                      }
                      
                      const startOfWeek = new Date(startDate)
                      startOfWeek.setDate(startDate.getDate() - startDate.getDay())
                      
                      const daysConfig = [
                        { name: 'DOMINGO', dayOfWeek: 0 },
                        { name: 'LUNES', dayOfWeek: 1 },
                        { name: 'MARTES', dayOfWeek: 2 },
                        { name: 'MIÉRCOLES', dayOfWeek: 3 },
                        { name: 'JUEVES', dayOfWeek: 4 },
                        { name: 'VIERNES', dayOfWeek: 5 },
                        { name: 'SÁBADO', dayOfWeek: 6 }
                      ]
                      
                      return daysConfig.map((day) => {
                        const date = new Date(startOfWeek)
                        date.setDate(startOfWeek.getDate() + day.dayOfWeek)
                        const dayNumber = date.getDate()
                        const monthName = date.toLocaleDateString('es-ES', { month: 'short' })
                        const fullDate = date.toISOString().split('T')[0]
                        
                        return (
                          <div key={day.name} className="p-4 text-center text-white font-extrabold text-sm border-r border-white/30 last:border-r-0" data-date={fullDate}>
                            <div>{day.name}</div>
                            <div className="text-lg font-bold mt-1">{dayNumber}</div>
                            <div className="text-xs opacity-90">{monthName}</div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  
                  {/* Filas de horas */}
                  {Array.from({ length: 19 }, (_, i) => i + 5).map((hour) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    let startDate = new Date(today)
                    if (reservas.length > 0) {
                      const reservationDates = reservas.map(r => parseLocalDateTime(r.datetime))
                      const minDate = new Date(Math.min(...reservationDates.map(d => d.getTime())))
                      minDate.setHours(0, 0, 0, 0)
                      if (minDate < today) {
                        startDate = minDate
                      }
                    }
                    
                    const startOfWeek = new Date(startDate)
                    startOfWeek.setDate(startDate.getDate() - startDate.getDay())
                    
                    return (
                      <div key={hour} className="grid grid-cols-8 border-t border-purple-200">
                        <div className="p-3 text-center bg-gradient-to-r from-purple-100 to-pink-100 border-r border-purple-200 flex flex-col items-center justify-center">
                          <div className="text-lg font-extrabold text-purple-700">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          <div className="text-xs text-purple-600 font-semibold">
                            {hour < 12 ? 'a.m.' : 'p.m.'}
                          </div>
                        </div>
                        
                        {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                          const cellDate = new Date(startOfWeek)
                          cellDate.setDate(startOfWeek.getDate() + dayOffset)
                          const cellDateStr = cellDate.toISOString().split('T')[0]
                          
                          const cellReservations = reservas.filter(r => {
                            const rDate = parseLocalDateTime(r.datetime)
                            const rDateStr = rDate.toISOString().split('T')[0]
                            const rHour = rDate.getHours()
                            return rDateStr === cellDateStr && rHour === hour
                          })
                          
                          return (
                            <div 
                              key={dayOffset} 
                              className="p-2 border-r border-purple-200 last:border-r-0 min-h-[80px] bg-white/50 hover:bg-purple-50/50 transition-colors"
                            >
                              {cellReservations.map((r) => (
                                <div 
                                  key={r.id} 
                                  className={`rounded-lg p-2 mb-1 shadow-md border-2 ${
                                    r.tipo === 'clase' 
                                      ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400' 
                                      : 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400'
                                  }`}
                                >
                                  <div className="flex items-center gap-1 mb-1">
                                    <span className="text-xs font-bold text-gray-800">
                                      {parseLocalDateTime(r.datetime).toLocaleTimeString('es-ES', { 
                                        hour: '2-digit', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      r.tipo === 'clase' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                                    }`}>
                                      {r.tipo === 'clase' ? 'Clase' : 'Examen'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      r.modalidad === 'virtual' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                                    }`}>
                                      {r.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}
                                    </span>
                                  </div>
                                  {r.curso && (
                                    <div className="mt-1 text-[10px] font-semibold text-gray-700 truncate">
                                      {r.curso}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          </>
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
  const [cursoFilter, setCursoFilter] = useState<string>('todos')

  // Filtrar slots por modalidad y curso
  const filteredSlots = slots.filter(s => {
    const matchModalidad = modalidadFilter === 'todas' || s.modalidad === modalidadFilter
    const matchCurso = cursoFilter === 'todos' || s.curso === cursoFilter
    return matchModalidad && matchCurso
  })

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
      {/* Filtros de modalidad y curso */}
      <div className="mb-4 space-y-4">
        {/* Filtro de Modalidad */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-sm font-bold text-gray-800">Modalidad:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setModalidadFilter('todas')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                modalidadFilter === 'todas'
                  ? 'bg-gradient-to-r from-brand-purple to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400 hover:shadow-md'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Todas ({slots.length})
            </button>
            <button
              onClick={() => setModalidadFilter('virtual')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                modalidadFilter === 'virtual'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-purple-300 hover:border-purple-500 hover:shadow-md'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Virtual ({slots.filter(s => s.modalidad === 'virtual').length})
            </button>
            <button
              onClick={() => setModalidadFilter('presencial')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                modalidadFilter === 'presencial'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-green-300 hover:border-green-500 hover:shadow-md'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Presencial ({slots.filter(s => s.modalidad === 'presencial').length})
            </button>
          </div>
        </div>

        {/* Filtro de Curso */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-bold text-gray-800">Tipo de curso:</span>
          </div>
          <select
            value={cursoFilter}
            onChange={e => setCursoFilter(e.target.value)}
            className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 transition-all shadow-sm hover:border-indigo-400 font-semibold bg-white"
          >
            <option value="todos">Todos los cursos</option>
            <option value="Inglés">Inglés</option>
            <option value="Francés">Francés</option>
            <option value="Español para extranjeros">Español para extranjeros</option>
            <option value="Club Conversacional">Club Conversacional</option>
            <option value="ConversArte">ConversArte</option>
            <option value="Tour Cafetero">Tour Cafetero</option>
            <option value="Cursos para niños">Cursos para niños</option>
            <option value="Clases personalizadas">Clases personalizadas</option>
            <option value="General">General</option>
          </select>
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
