import React from 'react'

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
  const whatsappMessage = encodeURIComponent(`Hola! Deseo solicitar un QR de pago para: ${productName || 'producto'}. Precio: ${price || ''}`)
  const openWhatsApp = () => window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <aside className="ml-auto w-full max-w-md bg-white rounded-l-2xl shadow-2xl overflow-auto">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">Formas de Pago</h3>
            <p className="text-sm text-gray-500">Proceso de pago por QR</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg">
            <h4 className="text-lg font-bold">📱 Solicita tu QR de pago</h4>
            <p className="text-white/90 mt-2">Escríbenos por WhatsApp y te generamos el QR personalizado.</p>
            <div className="mt-4 bg-white/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-sm text-white/90">Número</div>
                <div className="text-2xl font-bold">{phone}</div>
              </div>
              <button onClick={openWhatsApp} className="bg-white text-green-600 px-4 py-2 rounded-full font-semibold">Abrir WhatsApp</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <h5 className="font-bold mb-2">Información requerida</h5>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="font-semibold">Producto</div>
                <div className="text-sm text-gray-500">{productName || '-'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <div className="font-semibold">Precio</div>
                <div className="text-sm text-gray-500">{price ? `$${price}` : '-'}</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <strong>Proceso rápido:</strong> 1) Contacta por WhatsApp 2) Proporciona datos 3) Recibe QR 4) Realiza el pago
          </div>
        </div>
      </aside>
    </div>
  )
}
