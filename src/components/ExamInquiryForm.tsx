import { useState } from 'react'

export default function ExamInquiryForm({ exam }: { exam: string }) {
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [email, setEmail] = useState('')
  const WHATSAPP_NUMBER = '573227850345'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parts = [
      `Hola, me interesa la preparación para el examen ${exam}.`,
      nombre ? `Mi nombre es ${nombre}.` : '',
      edad ? `Tengo ${edad} años.` : '',
      email ? `Mi correo es ${email}.` : ''
    ].filter(Boolean)
    const mensaje = parts.join(' ')
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" value={exam} readOnly aria-label="Examen" />
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" placeholder="Edad" value={edad} onChange={e => setEdad(e.target.value)} />
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <button type="submit" className="btn-primary w-full">Quiero más información</button>
    </form>
  )
}
