
import { useEffect, useState } from 'react'

type Contact = {
  id: number;
  nombre: string;
  edad: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  idioma: string;
  modalidad: string;
  franja: string;
  created_at: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/contacts_list.php')
      .then(res => res.json())
      .then(data => setContacts(data.contacts || []))
      .catch(() => setError('No se pudieron cargar los contactos'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl shadow-lg p-8 bg-gradient-to-br from-brand-mauve/20 via-brand-cream to-brand-yellow/10 border border-brand-mauve/30">
      <h2 className="section-title text-brand-purple mb-6">Contactos recibidos</h2>
      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-500">No hay contactos registrados.</p>
      ) : (
        <div className="overflow-auto">
          <table className="table-clean min-w-max w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Nacionalidad</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Idioma</th>
                <th>Modalidad</th>
                <th>Franja</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nombre}</td>
                  <td>{c.edad}</td>
                  <td>{c.nacionalidad}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>{c.idioma}</td>
                  <td>{c.modalidad}</td>
                  <td>{c.franja}</td>
                  <td>{c.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
