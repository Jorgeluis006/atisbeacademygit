export default function Pago() {
  const whatsappNumber = '573227850345' // Número con código de país
  const whatsappMessage = encodeURIComponent('Hola! Deseo solicitar un QR de pago para realizar una compra.')

  const openWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')
  }

  return (
  <main className="bg-brand-beige">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            📱 Proceso de Pago por QR
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Para procesar tu compra, sigue estos sencillos pasos
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-padded py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* WhatsApp Contact Card - Destacado */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-3xl p-8 shadow-2xl mb-12 transform hover:scale-105 transition-transform duration-300">
            <div className="text-center">
              <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-2">💬 Escríbenos para generar tu QR de pago</h2>
              <p className="text-white/90 mb-6">Contacta a este número de WhatsApp y proporciona la siguiente información:</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <p className="text-5xl font-bold mb-2">3227850345</p>
                <p className="text-white/80">Horario de atención: 24/7</p>
              </div>
              <button 
                onClick={openWhatsApp}
                className="bg-white text-green-600 px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Abrir WhatsApp
              </button>
            </div>
          </div>

          {/* Información Requerida */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Información requerida:
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">🏷️</span>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Nombre del producto</h4>
                    <p className="text-gray-600">Especifica qué curso o producto te interesa adquirir</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">📧</span>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Datos de contacto</h4>
                    <p className="text-gray-600">Nombre completo y correo electrónico para el registro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proceso Rápido - Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              Proceso rápido:
            </h3>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">Contacta por WhatsApp</h4>
                  <p className="text-gray-600">Escribe al 3227850345</p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">Proporciona información</h4>
                  <p className="text-gray-600">Nombre del producto y tus datos de contacto</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">Recibe tu QR</h4>
                  <p className="text-gray-600">Te enviaremos el código QR personalizado</p>
                </div>
              </div>
              {/* Step 4 */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-purple text-white rounded-full flex items-center justify-center font-bold text-xl">4</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">Realiza el pago</h4>
                  <p className="text-gray-600">Escanea y paga desde tu app bancaria</p>
                </div>
              </div>
              {/* Step 5 - NEW */}
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl">5</div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                    Recibe tus credenciales de acceso
                    <span className="text-2xl">🎓</span>
                  </h4>
                  <p className="text-gray-600">Una vez confirmado el pago, te enviaremos tu <span className="font-semibold text-brand-purple">usuario y contraseña</span> para acceder a la Zona de Estudiantes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4 justify-center">
              <div className="text-5xl">🛡️</div>
              <div>
                <h3 className="text-2xl font-bold text-green-900">Pago 100% Seguro</h3>
                <p className="text-green-700">Transacciones protegidas y verificadas</p>
              </div>
            </div>
          </div>

          {/* Student Access Info - NEW */}
          <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 border-2 border-purple-300 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-500 text-white rounded-full mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-purple-900 mb-3">
                🎓 Acceso a la Zona de Estudiantes
              </h3>
              <p className="text-purple-800 text-lg mb-4 max-w-2xl mx-auto">
                Una vez que tu pago sea recibido y confirmado, te enviaremos por WhatsApp tus credenciales personales:
              </p>
              <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                  <div className="text-3xl mb-2">👤</div>
                  <h4 className="font-bold text-purple-900 mb-1">Usuario</h4>
                  <p className="text-sm text-purple-700">Tu nombre de usuario único</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
                  <div className="text-3xl mb-2">🔑</div>
                  <h4 className="font-bold text-purple-900 mb-1">Contraseña</h4>
                  <p className="text-sm text-purple-700">Tu clave de acceso segura</p>
                </div>
              </div>
              <p className="text-purple-700 mt-4 text-sm">
                ⚡ Tiempo estimado de entrega: <span className="font-bold">Menos de 1 hora</span> después de confirmar el pago
              </p>
            </div>
          </div>

          {/* CTA Final */}
          <div className="mt-12 text-center">
            <button 
              onClick={openWhatsApp}
              className="bg-brand-purple text-white px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Solicitar QR de Pago Ahora
            </button>
            <p className="text-gray-500 mt-4">Respuesta en menos de 5 minutos</p>
          </div>

        </div>
      </div>
    </main>
  )
}
