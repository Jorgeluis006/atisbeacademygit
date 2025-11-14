import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  productName?: string
  price?: number | string
  phone?: string
}

export default function PaymentDrawer({ open, onClose, productName, price, phone = '3162967105' }: Props) {
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
      <aside className="relative w-full max-w-lg bg-[#101015] text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2"><span className="text-sky-400">💳</span> Formas de Pago</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white" aria-label="Cerrar">✕</button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-8 px-6 py-6 scrollbar-thin">
          {/* Proceso título */}
          <div>
            <h4 className="text-sm font-semibold text-sky-300 mb-1 flex items-center gap-2">📱 Proceso de Pago por QR</h4>
            <p className="text-xs text-white/60 max-w-md">Para procesar tu compra, sigue estos sencillos pasos:</p>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg">
            <h5 className="font-bold text-center mb-3 text-sm flex flex-col items-center gap-1"><span>💬 Escríbenos para generar tu QR de pago</span></h5>
            <p className="text-xs text-white/90 text-center mb-4">Contacta a este número de WhatsApp y proporciona la siguiente información:</p>
            <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-center">
              <div className="flex items-center gap-3">
                <span className="text-xl">📱</span>
                <span className="font-bold text-green-600 text-lg tracking-wide">{phone}</span>
              </div>
            </div>
            <div className="text-center">
              <button onClick={openWhatsApp} className="bg-white text-green-600 px-6 py-2 rounded-md font-semibold text-sm shadow hover:shadow-lg hover:scale-[1.03] transition inline-flex items-center gap-2">
                Abrir WhatsApp
              </button>
            </div>
          </div>

          {/* Información requerida */}
          <div className="bg-white text-gray-900 rounded-2xl p-5 shadow divide-y divide-gray-200">
            <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">✧ Información requerida:</h5>
            <div className="py-4 flex items-start gap-4">
              <div className="w-1 h-10 bg-teal-400 rounded-full" />
              <div className="flex-1">
                <div className="font-semibold text-xs mb-1 flex items-center gap-2">🏷️ Nombre del producto</div>
                <input value={nombreProducto} onChange={e => setNombreProducto(e.target.value)} placeholder="Ej: Curso Intensivo A2" className="w-full text-xs bg-gray-50 border border-gray-300 rounded-md px-3 py-2" />
                <p className="text-[11px] text-gray-500 mt-1">Especifica qué curso / bicicleta / material te interesa.</p>
              </div>
            </div>
            <div className="py-4 flex items-start gap-4">
              <div className="w-1 h-10 bg-pink-400 rounded-full" />
              <div className="flex-1">
                <div className="font-semibold text-xs mb-1 flex items-center gap-2">🎨 Color preferido</div>
                <input value={colorPreferido} onChange={e => setColorPreferido(e.target.value)} placeholder="Ej: Rojo" className="w-full text-xs bg-gray-50 border border-gray-300 rounded-md px-3 py-2" />
                <p className="text-[11px] text-gray-500 mt-1">Indica el color que deseas (si aplica al producto).</p>
              </div>
            </div>
          </div>

          {/* Proceso rápido */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-5">
            <h5 className="text-sm font-semibold mb-4 flex items-center gap-2">⚡ Proceso rápido:</h5>
            <div className="space-y-4 text-xs">
              {[
                { n: 1, t: 'Contacta por WhatsApp', d: `Escribe al ${phone}` },
                { n: 2, t: 'Proporciona la información', d: 'Producto y color preferido' },
                { n: 3, t: 'Recibe tu QR', d: 'Generamos tu código personalizado' },
                { n: 4, t: 'Realiza el pago', d: 'Escanéalo desde tu app bancaria' },
                { n: 5, t: 'Recibe credenciales', d: 'Te enviamos usuario y contraseña' }
              ].map(step => (
                <div key={step.n} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-xs">{step.n}</div>
                  <div>
                    <div className="font-semibold">{step.t}</div>
                    <div className="text-white/60">{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barra inferior estilo estado */}
          <div className="bg-[#0d0d12] border border-white/10 rounded-xl p-4 flex items-center gap-3 text-xs">
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">i</div>
            <div className="flex-1">
              <div className="font-semibold text-white">Contacto por WhatsApp</div>
              <div className="text-white/60">Escribe al {phone}</div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <button onClick={openWhatsApp} className="bg-brand-purple text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition inline-flex items-center gap-2">
              Solicitar QR de Pago Ahora
            </button>
            <p className="text-white/50 mt-2 text-[11px]">Respuesta en menos de 5 minutos</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
