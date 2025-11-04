import { useState } from 'react'
import { sendContactForm } from '../services/api'

const initial = { nombre: '', edad: '', nacionalidad: '', email: '', telefono: '', idioma: '', modalidad: '', franja: '' }

export default function Contacto() {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle')

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await sendContactForm(form)
      setStatus('ok')
      setForm(initial)
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="container-padded w-full">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-center mb-8">Contacto</h1>
          <form onSubmit={onSubmit} className="grid gap-4 bg-brand-beige rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="grid md:grid-cols-2 gap-4">
              <input className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="nombre" placeholder="Nombre completo" required value={form.nombre} onChange={onChange} />
              <input className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="edad" placeholder="Edad" required value={form.edad} onChange={onChange} />
              <input className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="nacionalidad" placeholder="Nacionalidad" required value={form.nacionalidad} onChange={onChange} />
              <input className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" type="email" name="email" placeholder="Correo electrónico" required value={form.email} onChange={onChange} />
              <input className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="telefono" placeholder="Número de contacto" required value={form.telefono} onChange={onChange} />
              <input className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="idioma" placeholder="Idioma que desea aprender" required value={form.idioma} onChange={onChange} />
              <select className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="modalidad" required value={form.modalidad} onChange={onChange}>
                <option value="">Modalidad preferida</option>
                <option>virtual</option>
                <option>presencial</option>
                <option>grupal</option>
                <option>personalizada</option>
              </select>
              <input className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" name="franja" placeholder="Franja horaria preferida" required value={form.franja} onChange={onChange} />
            </div>
            <button className="btn-primary mt-4" type="submit" disabled={status==='sending'}>
              {status==='sending' ? 'Enviando…' : 'QUIERO COMENZAR'}
            </button>
            {status==='ok' && <p className="text-green-600 text-center font-semibold">¡Formulario enviado! Te contactaremos pronto.</p>}
            {status==='error' && <p className="text-red-600 text-center font-semibold">Hubo un error. Intenta de nuevo.</p>}
          </form>
        </div>
      </div>
    </main>
  )
}
