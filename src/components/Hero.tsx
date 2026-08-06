import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { sendContactForm, type ContactPayload } from '../services/api'

const initialForm: ContactPayload = {
  nombre: '', edad: '', nacionalidad: '', email: '', telefono: '', idioma: '', modalidad: '', franja: '',
}

function HeroRegisterForm() {
  const [form, setForm] = useState<ContactPayload>(initialForm)
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      alert('Por favor autoriza el tratamiento de datos para continuar.')
      return
    }
    setStatus('sending')
    try {
      await sendContactForm(form)
      setStatus('ok')
      setForm(initialForm)
      setConsent(false)
    } catch {
      setStatus('error')
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
    >
      <h2 className="text-2xl font-extrabold text-brand-black mb-1">¡Regístrate ya!</h2>
      <p className="text-sm text-brand-black/60 mb-5">
        Deja tus datos y te contactamos para tu clase de diagnóstico gratuita.
      </p>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input className={inputClass} name="nombre" placeholder="Nombre completo" required value={form.nombre} onChange={onChange} />
        <div className="grid grid-cols-2 gap-3">
          <input className={inputClass} type="email" name="email" placeholder="Correo electrónico" required value={form.email} onChange={onChange} />
          <input className={inputClass} name="telefono" placeholder="Teléfono (+57...)" value={form.telefono} onChange={onChange} />
        </div>
        <select className={inputClass} name="idioma" required value={form.idioma} onChange={onChange}>
          <option value="">Idioma que deseas aprender</option>
          <option>Inglés</option>
          <option>Francés</option>
          <option>Español para extranjeros</option>
          <option>Alemán</option>
          <option>Italiano</option>
          <option>Portugués</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <select className={inputClass} name="modalidad" required value={form.modalidad} onChange={onChange}>
            <option value="">Modalidad</option>
            <option>personalizada - virtual</option>
            <option>grupal - virtual</option>
            <option>Personalizada - presencial</option>
          </select>
          <select className={inputClass} name="franja" required value={form.franja} onChange={onChange}>
            <option value="">Horario</option>
            <option>Mañana</option>
            <option>Tarde</option>
            <option>Noche</option>
          </select>
        </div>
        <label className="flex items-start gap-2 text-xs text-brand-black/70">
          <input type="checkbox" className="mt-0.5" checked={consent} onChange={e => setConsent(e.target.checked)} />
          <span>
            Autorizo el tratamiento de mis datos según la{' '}
            <Link to="/politicas-privacidad" target="_blank" className="text-brand-purple underline">política de privacidad</Link>.
          </span>
        </label>
        <button className="btn-primary w-full justify-center mt-1" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Enviando…' : 'Enviar'}
        </button>
        {status === 'ok' && <p className="text-brand-green text-sm text-center font-semibold">¡Listo! Te contactaremos pronto.</p>}
        {status === 'error' && <p className="text-red-600 text-sm text-center font-semibold">Hubo un error. Intenta de nuevo.</p>}
      </form>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-purple via-purple-800 to-black">
      <div className="container-padded py-16 md:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center relative z-10">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-yellow text-brand-black text-xs font-bold tracking-wide mb-5">
            ACADEMIA DE IDIOMAS
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold uppercase leading-tight text-white"
          >
            El mundo a través de los <span className="text-brand-yellow">idiomas</span>
          </motion.h1>
          <p className="mt-5 text-lg text-white/85 max-w-prose">
            Aprende con el método ATIKA: progresivo, activo y personalizado. Sin presión, con acompañamiento real.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white font-semibold text-sm">
              98% de satisfacción de nuestros estudiantes
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(255, 247, 0, 0.5)',
                  '0 0 0 10px rgba(255, 247, 0, 0)',
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ borderRadius: '9999px' }}
            >
              <Link
                to="/contacto"
                className="inline-flex items-center justify-center rounded-full bg-brand-yellow text-brand-black px-6 py-3 font-bold shadow-soft hover:bg-white transition-all"
              >
                ¿QUIERES SABER TU NIVEL TOTALMENTE GRATIS?
              </Link>
            </motion.div>
            <Link to="/cursos" className="inline-flex items-center font-medium text-white hover:text-brand-yellow">Ver cursos</Link>
          </div>
          <p className="mt-3 text-sm text-white/60">Atendemos 24/7 • Cupos limitados por curso</p>

        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroRegisterForm />
        </div>
      </div>
    </section>
  )
}
