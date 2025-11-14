interface Props {
  open: boolean
  onClose: () => void
  productName?: string
  price?: number | string
  phone?: string
}

export default function PaymentDrawer({ open, onClose, productName, price, phone = '3227850345' }: Props) {
  if (!open) return null

  const whatsappNumber = `57${phone}`
  const whatsappMessage = encodeURIComponent(
    `Hola! Deseo solicitar un QR de pago para: ${productName || 'producto'}` + (price ? ` (precio: ${price})` : '')
  )
  const openWhatsApp = () => window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="ml-auto w-full max-w-xl bg-white rounded-l-2xl shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold">Formas de Pago</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">✕</button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-8 px-5 py-6">
          {/* WhatsApp Contact Card (adapted) */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="text-center">
              <div className="inline-block p-3 bg-white/20 rounded-full mb-3">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h4 className="text-2xl font-bold mb-1">💬 Escríbenos para generar tu QR</h4>
              <p className="text-white/90 mb-4 text-sm">Contacta a este número y proporciona la información:</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                <p className="text-3xl font-bold mb-1">{phone}</p>
                <p className="text-white/80 text-sm">Horario de atención: 24/7</p>
              </div>
              <button onClick={openWhatsApp} className="bg-white text-green-600 px-6 py-3 rounded-full font-bold shadow hover:shadow-lg hover:scale-105 transition inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                Abrir WhatsApp
              </button>
            </div>
          </div>

          {/* Información requerida */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h5 className="text-lg font-bold mb-4 flex items-center gap-2">📋 Información requerida</h5>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <h6 className="font-semibold text-sm mb-1">Nombre del producto</h6>
                <p className="text-xs text-gray-600">{productName || '—'}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h6 className="font-semibold text-sm mb-1">Precio</h6>
                <p className="text-xs text-gray-600">{price ? `$${price}` : '—'}</p>
              </div>
            </div>
          </div>

          {/* Proceso rápido */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h5 className="text-lg font-bold mb-6 flex items-center gap-2">⚡ Proceso rápido</h5>
              <div className="space-y-5 text-sm">
                {[
                  { n: 1, t: 'Contacta por WhatsApp', d: `Escribe al ${phone}` },
                  { n: 2, t: 'Proporciona información', d: 'Producto y tus datos de contacto' },
                  { n: 3, t: 'Recibe tu QR', d: 'Te enviamos el código QR personalizado' },
                  { n: 4, t: 'Realiza el pago', d: 'Escanea y paga desde tu app bancaria' },
                  { n: 5, t: 'Recibe credenciales', d: 'Usuario y contraseña para acceder a la Zona de Estudiantes' }
                ].map(step => (
                  <div key={step.n} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-sm">{step.n}</div>
                    <div>
                      <div className="font-semibold">{step.t}</div>
                      <div className="text-gray-600 text-xs">{step.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          {/* Seguridad */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center">
            <div className="flex items-center gap-3 justify-center">
              <div className="text-3xl">🛡️</div>
              <div>
                <div className="font-bold text-green-900">Pago 100% Seguro</div>
                <div className="text-green-700 text-xs">Transacciones protegidas y verificadas</div>
              </div>
            </div>
          </div>

          {/* Acceso estudiantes */}
          <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 border border-purple-300 rounded-2xl p-6">
            <div className="text-center">
              <div className="inline-block p-3 bg-purple-500 text-white rounded-full mb-3">🎓</div>
              <h5 className="text-xl font-bold text-purple-900 mb-2">Acceso a la Zona de Estudiantes</h5>
              <p className="text-purple-800 text-sm mb-3">Tras confirmar el pago recibirás tus credenciales personales:</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/80 rounded-xl p-3 border border-purple-200">
                  <div className="text-xl mb-1">👤</div>
                  <div className="font-semibold text-purple-900">Usuario</div>
                  <div className="text-purple-700 text-xs">Nombre único</div>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-purple-200">
                  <div className="text-xl mb-1">🔑</div>
                  <div className="font-semibold text-purple-900">Contraseña</div>
                  <div className="text-purple-700 text-xs">Clave segura</div>
                </div>
              </div>
              <p className="text-purple-700 mt-3 text-xs">Tiempo estimado: <span className="font-bold">menos de 1 hora</span> tras confirmar pago.</p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center pb-4">
            <button onClick={openWhatsApp} className="bg-brand-purple text-white px-8 py-4 rounded-full font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
              Solicitar QR de Pago Ahora
            </button>
            <p className="text-gray-500 mt-2 text-xs">Respuesta en menos de 5 minutos</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
