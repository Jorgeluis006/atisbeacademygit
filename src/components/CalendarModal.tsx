import { useState } from 'react'

interface CalendarModalProps {
  open: boolean
  onClose: () => void
  reservations?: Array<{ date: string; [key: string]: any }>
}

export default function CalendarModal({ open, onClose, reservations = [] }: CalendarModalProps) {
  if (!open) return null

  const [currentDate, setCurrentDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const hasReservation = (day: number) => {
    if (!day) return false
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return reservations.some(r => r.date.startsWith(dateStr))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-purple to-purple-600 text-white flex items-center justify-between sticky top-0 z-10">
          <h3 className="text-xl font-bold">📅 Calendario Mensual</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl" aria-label="Cerrar">✕</button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Mes anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-bold text-gray-900 capitalize flex-1 text-center">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Próximo mes"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                  !day
                    ? 'bg-gray-50'
                    : hasReservation(day)
                    ? 'bg-brand-purple text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-4 h-4 bg-brand-purple rounded"></div>
              <span className="text-gray-700">Tienes clase agendada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
