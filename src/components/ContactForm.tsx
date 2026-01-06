import { useEffect, useState } from 'react'
import { sendContactForm } from '../services/api'

const initial = { nombre: '', edad: '', nacionalidad: '', email: '', telefono: '', idioma: '', modalidad: '', franja: '', curso: '', dia_interes: '' }

export type ContactPrefill = Partial<typeof initial>

export default function ContactForm({ prefill, title = 'Contacto' }: { prefill?: ContactPrefill; title?: string }) {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle')
  const [consent, setConsent] = useState(false)

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

  useEffect(() => {
    if (prefill) {
      setForm(f => ({ ...f, ...prefill }))
    }
  }, [prefill])

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      alert('Por favor autoriza el tratamiento de datos por ATISBE para continuar.')
      return
    }
    setStatus('sending')
    try {
      await sendContactForm(form)
      setStatus('ok')
      setForm(initial)
      setConsent(false)
    } catch {
      setStatus('error')
    }
  }

  function handleWhatsAppClick(e: React.FormEvent) {
    e.preventDefault()

    if (!form.nombre || !form.curso || !form.dia_interes) {
      alert('Por favor completa Nombre, Curso y Día de interés')
      return
    }

    const mensaje = `Hola Atisbe, me gustaría obtener más información sobre el curso de *${form.curso}*. Estoy interesado en clases el/los ${form.dia_interes}. Mi nombre es ${form.nombre}.`
    const numeroWhatsApp = '573227850345'
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`
    window.open(urlWhatsApp, '_blank')
  }

  return (
    <section className="py-8 sm:py-12">
      <div className="container-padded w-full">
        <div className="max-w-3xl mx-auto px-3 sm:px-0">
          {title && <h2 className="text-2xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8">{title}</h2>}
          <form onSubmit={onSubmit} className="grid gap-3 sm:gap-4 bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100 pb-24 sm:pb-8">
            <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
              <input className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="nombre" placeholder="Nombre completo" required value={form.nombre} onChange={onChange} />
              <input className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="edad" placeholder="Edad" required value={form.edad} onChange={onChange} />
              <input className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="nacionalidad" placeholder="Nacionalidad" required value={form.nacionalidad} onChange={onChange} />
              <input className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" type="email" name="email" placeholder="Correo electrónico" required value={form.email} onChange={onChange} />
              <input className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="telefono" placeholder="Número de contacto" required value={form.telefono} onChange={onChange} />
              <select className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="idioma" required value={form.idioma} onChange={onChange}>
                <option value="">Idioma que desea aprender</option>
                <option>Inglés</option>
                <option>Francés</option>
                <option>Español para extranjeros</option>
                <option>Alemán</option>
                <option>Italiano</option>
                <option>Portugués</option>
              </select>
              <input className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="curso" placeholder="¿En qué estás interesado?" required value={form.curso} onChange={onChange} />
              <select className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="modalidad" required value={form.modalidad} onChange={onChange}>
                <option value="">Modalidad preferida</option>
                <option>virtual</option>
                <option>presencial</option>
                <option>grupal</option>
                <option>personalizada</option>
              </select>
              <select className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="dia_interes" required value={form.dia_interes} onChange={onChange}>
                <option value="">Día de interés</option>
                {diasSemana.map(dia => (
                  <option key={dia} value={dia}>{dia}</option>
                ))}
              </select>
              <select className="border border-gray-300 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="franja" required value={form.franja} onChange={onChange}>
                <option value="">Franja horaria preferida</option>
                <option>Mañana</option>
                <option>Tarde</option>
                <option>Noche</option>
              </select>
            </div>
            <label className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
              <input type="checkbox" className="mt-1" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>
                Autorizo de manera previa, expresa, informada e inequívoca a <strong>ATISBE</strong> para que los datos suministrados en este formulario sean tratados de conformidad con la política de tratamiento de datos, la cual podrás consultar
                {' '}<a href="/politicas-privacidad" target="_blank" rel="noopener" className="text-brand-purple underline">aquí</a>.
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
              <button className="btn-primary w-full sm:flex-1 min-h-[44px]" type="submit" disabled={status==='sending' || !consent}>
                {status==='sending' ? 'Enviando…' : 'ENVIAR FORMULARIO'}
              </button>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full sm:flex-1 min-h-[44px] bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.946 1.347l-.356.192-.369-.067-1.54.48.49-1.794.355-.191A9.879 9.879 0 0111.051 2C18.425 2 24 7.574 24 14.95c0 7.377-5.575 12.95-12.949 12.95-2.159 0-4.281-.506-6.301-1.471l-.361-.192-.389.058-1.702.551.591-2.161.375-.174c-1.115-1.241-1.826-2.844-1.826-4.611 0-7.377 5.575-12.95 12.949-12.95Z"/>
                </svg>
                CONTACTAR POR WHATSAPP
              </button>
            </div>
            {status==='ok' && <p className="text-green-600 text-center font-semibold">¡Formulario enviado! Te contactaremos pronto.</p>}
            {status==='error' && <p className="text-red-600 text-center font-semibold">Hubo un error. Intenta de nuevo.</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
