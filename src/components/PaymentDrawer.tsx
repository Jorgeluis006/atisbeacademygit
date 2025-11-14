import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  productName?: string
  price?: number | string
  phone?: string
}

export default function PaymentDrawer({ open, onClose, productName, price, phone = '3227850345' }: Props) {
  if (!open) return null
  const [colorPreferido, setColorPreferido] = useState('')
  const [nombreProducto, setNombreProducto] = useState(productName || '')

  const whatsappNumber = `57${phone}`
  const whatsappMessage = encodeURIComponent(
    `Hola! Quiero solicitar un QR de pago. Producto: ${nombreProducto || productName || '---'}${price ? ` | Precio: ${price}` : ''}${colorPreferido ? ` | Color: ${colorPreferido}` : ''}`
  )
  const openWhatsApp = () => window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-purple to-purple-600 text-white flex items-center justify-between sticky top-0 z-10">
          <h3 className="text-xl font-bold">📱 Proceso de Pago por QR</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl" aria-label="Cerrar">✕</button>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-6 px-6 py-6">
          
          {/* WhatsApp Contact Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3">💬 Escríbenos para generar tu QR de pago</h2>
              <p className="text-green-50 mb-4">Contacta a este número de WhatsApp y proporciona la siguiente información:</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="text-3xl font-bold mb-1">{phone}</p>
                <p className="text-green-100 text-sm">Horario de atención: 24/7</p>
              </div>
              <button 
                onClick={openWhatsApp}
                className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold text-sm shadow hover:shadow-lg hover:scale-105 transition inline-flex items-center gap-2"
              >
                Abrir WhatsApp
              </button>
            </div>
          </div>

          {/* Información Requerida */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> Información requerida:
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="font-bold text-purple-900 text-sm mb-2 flex items-center gap-2">🏷️ Nombre del producto</div>
                <input value={nombreProducto} onChange={e => setNombreProducto(e.target.value)} placeholder="Especifica qué curso o producto te interesa adquirir" className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2" />
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <div className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">🎨 Color preferido</div>
                <input value={colorPreferido} onChange={e => setColorPreferido(e.target.value)} placeholder="Indica el color que deseas (si aplica al producto)" className="w-full text-sm bg-white border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
          </div>

          {/* Proceso Rápido - Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚡</span> Proceso rápido:
            </h3>
            <div className="space-y-4">
              {[
                { n: 1, t: 'Contacta por WhatsApp', d: `Escribe al ${phone}` },
                { n: 2, t: 'Proporciona información', d: 'Nombre del producto y color' },
                { n: 3, t: 'Recibe tu QR', d: 'Te enviaremos el código personalizado' },
                { n: 4, t: 'Realiza el pago', d: 'Escanéalo desde tu app bancaria' },
                { n: 5, t: 'Recibe credenciales de acceso', d: 'Usuario y contraseña para estudiar' }
              ].map(step => (
                <div key={step.n} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold">{step.n}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{step.t}</h4>
                    <p className="text-xs text-gray-600">{step.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3 justify-center">
            <div className="text-3xl">🛡️</div>
            <div>
              <h3 className="font-bold text-green-900 text-sm">Pago 100% Seguro</h3>
              <p className="text-xs text-green-700">Transacciones protegidas y verificadas</p>
            </div>
          </div>

          {/* Student Access Info */}
          <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6">
            <div className="text-center">
              <div className="inline-block p-3 bg-purple-500 text-white rounded-full mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-purple-900 mb-2">
                🎓 Acceso a la Zona de Estudiantes
              </h3>
              <p className="text-purple-800 text-sm mb-3 max-w-md mx-auto">
                Una vez confirmado el pago, recibirás tus credenciales personales:
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <div className="bg-white/80 rounded-lg p-3 border border-purple-200">
                  <div className="text-2xl mb-1">👤</div>
                  <h4 className="font-bold text-purple-900 text-xs">Usuario</h4>
                  <p className="text-xs text-purple-700">Nombre único</p>
                </div>
                <div className="bg-white/80 rounded-lg p-3 border border-purple-200">
                  <div className="text-2xl mb-1">🔑</div>
                  <h4 className="font-bold text-purple-900 text-xs">Contraseña</h4>
                  <p className="text-xs text-purple-700">Acceso seguro</p>
                </div>
              </div>
              <p className="text-purple-700 mt-3 text-xs">
                ⚡ <span className="font-bold">Menos de 1 hora</span> después de confirmar el pago
              </p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center py-2">
            <button 
              onClick={openWhatsApp}
              className="bg-brand-purple text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition inline-flex items-center gap-2"
            >
              Solicitar QR de Pago Ahora
            </button>
            <p className="text-gray-500 mt-2 text-xs">Respuesta en menos de 5 minutos</p>
          </div>

        </div>
      </aside>
    </div>
  )
}
