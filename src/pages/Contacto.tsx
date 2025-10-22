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
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Contacto</h1>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4 bg-white rounded-2xl p-6 shadow-soft max-w-3xl">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="border rounded-md px-3 py-2" name="nombre" placeholder="Nombre completo" required value={form.nombre} onChange={onChange} />
          <input className="border rounded-md px-3 py-2" name="edad" placeholder="Edad" required value={form.edad} onChange={onChange} />
          <input className="border rounded-md px-3 py-2" name="nacionalidad" placeholder="Nacionalidad" required value={form.nacionalidad} onChange={onChange} />
          <input className="border rounded-md px-3 py-2" type="email" name="email" placeholder="Correo electrónico" required value={form.email} onChange={onChange} />
          <input className="border rounded-md px-3 py-2" name="telefono" placeholder="Número de contacto" required value={form.telefono} onChange={onChange} />
          <input className="border rounded-md px-3 py-2" name="idioma" placeholder="Idioma que desea aprender" required value={form.idioma} onChange={onChange} />
          <select className="border rounded-md px-3 py-2" name="modalidad" required value={form.modalidad} onChange={onChange}>
            <option value="">Modalidad preferida</option>
            <option>virtual</option>
            <option>presencial</option>
            <option>grupal</option>
            <option>personalizada</option>
          </select>
          <input className="border rounded-md px-3 py-2" name="franja" placeholder="Franja horaria preferida" required value={form.franja} onChange={onChange} />
        </div>
        <button className="btn-primary" type="submit" disabled={status==='sending'}>
          {status==='sending' ? 'Enviando…' : 'QUIERO COMENZAR'}
        </button>
        {status==='ok' && <p className="text-green-600">¡Formulario enviado! Te contactaremos pronto.</p>}
        {status==='error' && <p className="text-red-600">Hubo un error. Intenta de nuevo.</p>}
      </form>
    </main>
  )
}
