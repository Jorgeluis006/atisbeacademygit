import { useState } from 'react'
import { sendContactForm } from '../services/api'

export default function ExamInquiryForm({ exam }: { exam: string }) {
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const WHATSAPP_NUMBER = '573227850345'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) {
      alert('Por favor autoriza el tratamiento de datos por ATISBE para continuar.')
      return
    }
    try {
      await sendContactForm({
        nombre: nombre || '—',
        edad: edad || '—',
        nacionalidad: '—',
        email: email || '—',
        telefono: '—',
        idioma: `Examen: ${exam}`,
        modalidad: 'examen',
        franja: '—'
      })
      const parts = [
        `Hola, me interesa la preparación para el examen ${exam}.`,
        nombre ? `Mi nombre es ${nombre}.` : '',
        edad ? `Tengo ${edad} años.` : '',
        email ? `Mi correo es ${email}.` : ''
      ].filter(Boolean)
      const mensaje = parts.join(' ')
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank')
      alert('¡Tu solicitud fue enviada! Te contactaremos pronto.')
    } catch {
      alert('No se pudo enviar la solicitud. Intenta nuevamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" value={exam} readOnly aria-label="Examen" />
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" placeholder="Edad" value={edad} onChange={e => setEdad(e.target.value)} />
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <label className="flex items-start gap-3 text-xs sm:text-sm text-gray-700">
        <input type="checkbox" className="mt-1" checked={consent} onChange={e => setConsent(e.target.checked)} />
        <span>
          Autorizo de manera previa, expresa, informada e inequívoca a <strong>ATISBE</strong> para que los datos suministrados en este formulario sean tratados de conformidad con la política de tratamiento de datos, la cual podrás consultar
          {' '}<a href="/politicas-privacidad" target="_blank" rel="noopener" className="text-brand-purple underline">aquí</a>.
        </span>
      </label>
      <button type="submit" className="btn-primary w-full" disabled={!consent}>Quiero más información</button>
    </form>
  )
}
