import { useEffect, useState } from 'react'
import { EXPORT_CONTACTS_URL } from '../services/api'

export default function AdminContacts() {
  const [csvUrl, setCsvUrl] = useState<string | null>(null)

  useEffect(() => {
    setCsvUrl(EXPORT_CONTACTS_URL)
  }, [])

  return (
    <div className="rounded-xl shadow-lg p-8 bg-gradient-to-br from-brand-mauve/20 via-brand-cream to-brand-yellow/10 border border-brand-mauve/30">
      <h2 className="section-title text-brand-purple mb-6">Contactos recibidos</h2>
      <p className="mb-4 text-gray-700">Aquí puedes descargar todos los datos enviados por el formulario de contacto.</p>
      <a
        href={csvUrl || '#'}
        className="btn-primary bg-brand-purple hover:bg-brand-purple/90 text-white px-6 py-3 rounded-lg font-semibold"
        download
      >
        Descargar contactos (CSV)
      </a>
    </div>
  )
}
