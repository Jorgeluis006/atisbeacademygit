import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, logout as apiLogout, me as apiMe, getStudentProgress, type StudentProgress, getScheduleSlots, createReservation, getMyReservations, cancelReservation, type ScheduleSlot, type Reservation, forgotPassword, changePassword } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import CalendarModal from '../components/CalendarModal'

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  
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
  
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setForgotLoading(true)
    setForgotMessage('')
    
    try {
      await forgotPassword(forgotEmail)
      setForgotMessage('Si el correo existe, recibirás instrucciones para restablecer tu contraseña')
      setForgotEmail('')
    } catch (err: any) {
      setForgotMessage(err?.response?.data?.message || 'Error al procesar la solicitud')
    } finally {
      setForgotLoading(false)
    }
  }
  
  if (showForgotPassword) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 w-full max-w-md">
        <button 
          onClick={() => {
            setShowForgotPassword(false)
            setForgotMessage('')
            setForgotEmail('')
          }}
          className="text-brand-purple hover:text-brand-purple/80 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio de sesión
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-center">Recuperar contraseña</h2>
        
        <form onSubmit={handleForgotPassword}>
          <p className="text-gray-600 mb-4 text-center">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
          
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="forgot-email">
            Correo electrónico
          </label>
          <input 
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
            placeholder="tu@correo.com" 
            value={forgotEmail} 
            onChange={(e) => setForgotEmail(e.target.value)} 
            required
          />
          
          {forgotMessage && (
            <p className="text-brand-purple text-sm mb-4 text-center font-semibold bg-brand-cream p-3 rounded-lg">
              {forgotMessage}
            </p>
          )}
          
          <button className="btn-primary w-full" type="submit" disabled={forgotLoading}>
            {forgotLoading ? 'Enviando…' : 'Enviar instrucciones'}
          </button>
        </form>
      </div>
    )
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
      
      <div className="text-center mb-4">
        <button 
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-brand-purple hover:text-brand-purple/80 font-semibold"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      
      {error && <p className="text-red-600 text-sm mb-4 text-center font-semibold">{error}</p>}
      
      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }
    
    setLoading(true)
    
    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">¡Contraseña actualizada!</h3>
          <p className="text-gray-600">Tu contraseña ha sido cambiada exitosamente.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Cambiar contraseña</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contraseña actual
          </label>
          <div className="relative mb-4">
            <input 
              type={showCurrent ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              placeholder="••••••••" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrent ? '🙈' : '👁️'}
            </button>
          </div>
          
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nueva contraseña
          </label>
          <div className="relative mb-4">
            <input 
              type={showNew ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              placeholder="••••••••" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNew ? '🙈' : '👁️'}
            </button>
          </div>
          
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirmar nueva contraseña
          </label>
          <div className="relative mb-6">
            <input 
              type={showConfirm ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)

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

  // Función para generar PDF del horario semanal
  function downloadSchedulePDF() {
    try {
      console.log('Iniciando generación de PDF...')
      console.log('Reservas:', reservas)
      
      const doc = new jsPDF('landscape')
    
    // Título
    doc.setFontSize(18)
    doc.setTextColor(121, 30, 186) // brand-purple
    doc.text('Mi Horario Semanal - Atisbe Academy', 148, 15, { align: 'center' })
    
    // Información del estudiante
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Estudiante: ${user?.name || user?.username || 'N/A'}`, 14, 25)
    
    // Calcular semana actual
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    doc.text(`Semana: ${startOfWeek.toLocaleDateString('es-ES')} - ${endOfWeek.toLocaleDateString('es-ES')}`, 14, 31)
    
    // Preparar datos para la tabla
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const headers = ['Hora', ...daysOfWeek]
    
    // Crear filas para cada hora (5am - 11pm)
    const rows = []
    for (let hour = 5; hour <= 23; hour++) {
      const row = [`${hour.toString().padStart(2, '0')}:00`]
      
      // Para cada día de la semana
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const targetDate = new Date(startOfWeek)
        targetDate.setDate(startOfWeek.getDate() + dayOfWeek)
        const targetDateStr = targetDate.toISOString().split('T')[0]
        
        // Buscar reservas para esta hora y día
        const reservation = reservas.find(res => {
          const dt = parseLocalDateTime(res.datetime)
          const resDateStr = dt.toISOString().split('T')[0]
          return dt.getHours() === hour && resDateStr === targetDateStr
        })
        
        if (reservation) {
          // Formato: Tipo (Modalidad) - Hora
          const tipo = reservation.tipo === 'clase' ? 'Clase' : 'Examen'
          const modalidad = reservation.modalidad === 'virtual' ? 'Virtual' : 'Presencial'
          const hora = parseLocalDateTime(reservation.datetime).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })
          row.push(`${tipo}\n(${modalidad})\n${hora}`)
        } else {
          row.push('')
        }
      }
      
      rows.push(row)
    }
    
    // Generar tabla con autoTable
    autoTable(doc, {
      startY: 38,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [121, 30, 186], // brand-purple
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 7,
        halign: 'center',
        valign: 'middle',
        cellPadding: 2,
        minCellHeight: 12
      },
      columnStyles: {
        0: { 
          fillColor: [191, 166, 164], 
          fontStyle: 'bold', 
          textColor: [255, 255, 255],
          cellWidth: 20
        } // Primera columna (horas) con brand-mauve
      },
      alternateRowStyles: {
        fillColor: [255, 254, 241] // brand-cream
      },
      margin: { top: 38, left: 14, right: 14 }
    })
    
    // Pie de página
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')} - Atisbe Academy`, 148, 200, { align: 'center' })
    
    // Guardar PDF
    const fileName = `Horario_Semanal_${startOfWeek.toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    console.log('PDF generado exitosamente:', fileName)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar el PDF. Por favor, revisa la consola para más detalles.')
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
    <main className="bg-brand-cream">
      {/* Header con título */}
      <div className="bg-brand-purple py-12">
        <div className="container-padded">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
            Zona de estudiantes
          </h1>
          <p className="text-brand-cream text-center mt-3 text-lg">
            Tu espacio personalizado de aprendizaje
          </p>
        </div>
      </div>

      <div className="container-padded py-12">
        {!user ? (
          <>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <p className="text-xl text-gray-500">Cargando…</p>
              </div>
            ) : (
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
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-8">
              <div className="text-sm text-brand-black/70">
                Sesión: <span className="font-semibold">{user.name || user.username}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 font-semibold flex items-center gap-2"
                  onClick={() => setShowChangePassword(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Cambiar contraseña
                </button>
                <button className="btn-secondary" onClick={handleLogout}>Salir</button>
              </div>
            </div>
          {loadingData ? (
            <div className="mt-6">
              <p>Cargando datos del estudiante…</p>
            </div>
          ) : (
            <>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
            <section className="bg-gradient-to-br from-brand-mauve/20 via-brand-cream to-brand-mauve/30 rounded-2xl p-6 shadow-xl border-2 border-brand-mauve">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-8 h-8 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">Progreso</h2>
              </div>
              {!progress ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-brand-mauve">
                  <svg className="animate-spin w-10 h-10 mx-auto mb-2 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-sm text-gray-600 font-semibold">Cargando progreso…</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Asistencia */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-brand-orange/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Asistencia
                      </span>
                      <span className="text-2xl font-extrabold text-brand-orange">{progress.asistencia}%</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-brand-orange to-brand-yellow h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progress.asistencia}%` }}
                      />
                    </div>
                  </div>

                  {/* Tipo de Curso */}
                  {progress.curso && (
                    <div className="bg-gradient-to-br from-brand-purple/10 to-brand-purple/20 rounded-xl p-4 shadow-md border-2 border-brand-purple/50">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-6 h-6 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="font-bold text-gray-800">Tipo de Curso</span>
                      </div>
                      <div className="text-2xl font-extrabold text-brand-purple">{progress.curso}</div>
                    </div>
                  )}

                  {/* Nivel MCER */}
                  <div className="bg-gradient-to-br from-brand-yellow/20 to-brand-orange/20 rounded-xl p-4 shadow-md border-2 border-brand-yellow/50">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span className="font-bold text-gray-800">Nivel (MCER)</span>
                    </div>
                    <div className="text-3xl font-extrabold text-brand-orange mb-2">{progress.nivel.mcer}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{progress.nivel.descripcion}</p>
                  </div>

                  {/* Notas */}
                  <div className="bg-white rounded-xl p-4 shadow-md border border-brand-mauve">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <div key={idx} className="bg-gradient-to-r from-brand-mauve/20 to-brand-purple/10 rounded-lg p-3 border border-brand-mauve/50">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-semibold text-gray-800 text-sm flex items-center gap-1">
                                <svg className="w-4 h-4 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div className="bg-gradient-to-br from-brand-yellow/20 to-brand-yellow/30 rounded-xl p-4 shadow-md border-2 border-brand-yellow/50">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-bold text-gray-800">Fortalezas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {progress.fortalezas.length === 0 ? (
                        <span className="text-sm text-gray-600">Sin fortalezas registradas</span>
                      ) : (
                        progress.fortalezas.map((f, idx) => (
                          <span key={idx} className="bg-brand-orange text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {f}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Debilidades */}
                  <div className="bg-gradient-to-br from-brand-mauve/20 to-brand-mauve/30 rounded-xl p-4 shadow-md border-2 border-brand-mauve/50">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="font-bold text-gray-800">Áreas de mejora</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {progress.debilidades.length === 0 ? (
                        <span className="text-sm text-gray-600">Sin áreas de mejora registradas</span>
                      ) : (
                        progress.debilidades.map((d, idx) => (
                          <span key={idx} className="bg-brand-purple text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                            {d}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="md:col-span-2">
            <section className="bg-gradient-to-br from-brand-purple/10 via-brand-mauve/20 to-brand-purple/10 rounded-2xl p-6 shadow-xl border-2 border-brand-purple/30">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-8 h-8 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-orange bg-clip-text text-transparent">Horarios / Agendar</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">Agenda clases personalizadas y exámenes.</p>
              <ScheduleSection slots={slots} reservas={reservas} onBooked={async () => setReservas(await getMyReservations())} onCancel={async () => setReservas(await getMyReservations())} showCalendar={showCalendar} setShowCalendar={setShowCalendar} />
            </section>
            </div>
          </div>

          {/* Mascota MCER - Abajo ocupando todo el ancho */}
          <section className="mt-6 bg-gradient-to-br from-brand-mauve/20 via-brand-yellow/10 to-brand-orange/20 rounded-2xl p-8 shadow-xl border-2 border-brand-mauve/50">
            <div className="flex items-center justify-center gap-3 mb-6">
              <svg className="w-10 h-10 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-orange bg-clip-text text-transparent">Mascota MCER</h2>
              <svg className="w-10 h-10 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Imagen de la mascota */}
              <div className="relative w-full h-96 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-lg border-2 border-brand-mauve">
                <div className="absolute inset-0 flex items-center justify-center p-6">
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
              
              {/* Información del nivel */}
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-brand-purple/50">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-800">
                      {progress?.nivel?.mcer ? `Nivel ${progress.nivel.mcer}` : 'Tu Nivel'}
                    </h3>
                  </div>
                  <p className="text-lg font-semibold text-brand-purple mb-4">
                    {progress?.nivel?.mcer ? `¡Tu mascota está creciendo! 🌱` : '¡Comienza tu aventura! 🌱'}
                  </p>
                  {progress?.nivel?.descripcion && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {progress.nivel.descripcion}
                    </p>
                  )}
                </div>

                {/* Barra de progreso */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-brand-orange/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-700">Progreso MCER</span>
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-purple to-brand-orange bg-clip-text text-transparent">
                      {progress?.nivel?.mcer ? 
                        (progress.nivel.mcer === 'A1' ? '20%' : 
                         progress.nivel.mcer === 'A2' ? '35%' :
                         progress.nivel.mcer === 'B1' ? '50%' :
                         progress.nivel.mcer === 'B2' ? '65%' :
                         progress.nivel.mcer === 'C1' ? '85%' : 
                         progress.nivel.mcer === 'C2' ? '100%' : '10%') 
                        : '10%'}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-brand-purple via-brand-mauve to-brand-orange h-full rounded-full transition-all duration-500 shadow-md" style={{ 
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
                  <div className="mt-3 flex justify-between text-xs text-gray-600">
                    <span>A1</span>
                    <span>A2</span>
                    <span>B1</span>
                    <span>B2</span>
                    <span>C1</span>
                    <span>C2</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Calendario Semanal - Abajo de todo */}
          <section className="mt-6 bg-gradient-to-br from-brand-mauve/20 via-brand-cream to-brand-purple/10 rounded-2xl p-6 shadow-xl border-2 border-brand-mauve/50">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-brand-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-orange bg-clip-text text-transparent">Mis Clases - Vista Semanal</h2>
              </div>
              {reservas.length > 0 && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowCalendar(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">Ver Mes</span>
                  </button>
                  <button 
                    onClick={downloadSchedulePDF}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-semibold">Descargar PDF</span>
                  </button>
                </div>
              )}
            </div>            {reservas.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center border border-brand-mauve">
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
                      // Siempre mostrar la semana actual
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      
                      // Calcular el inicio de la semana actual (domingo)
                      const startOfWeek = new Date(today)
                      startOfWeek.setDate(today.getDate() - today.getDay())
                      
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
                    // Siempre usar la semana actual
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    const startOfWeek = new Date(today)
                    startOfWeek.setDate(today.getDate() - today.getDay())
                    
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
                                  {r.meeting_link && (
                                    <a 
                                      href={r.meeting_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="mt-1 inline-flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-md text-[10px] font-bold hover:bg-purple-700 transition-colors"
                                      title="Unirse a la clase"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                      <span>Link</span>
                                    </a>
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
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
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

function ScheduleSection({ slots, reservas, onBooked, onCancel, showCalendar, setShowCalendar }: { slots: ScheduleSlot[]; reservas: Reservation[]; onBooked: () => void; onCancel: () => void; showCalendar: boolean; setShowCalendar: (v: boolean) => void }) {
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
                    {r.meeting_link && (
                      <div className="mt-3">
                        <a 
                          href={r.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-lg hover:from-purple-600 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl text-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Unirse a la clase</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    )}
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

      {/* Calendar Modal */}
      <CalendarModal 
        open={showCalendar} 
        onClose={() => setShowCalendar(false)} 
        reservations={reservas.map(r => {
          const dt = parseLocalDateTime(r.datetime)
          const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
          return {
            date: dateStr,
            ...r
          }
        })}
      />
    </div>
  )
}
