import { useEffect, useState } from 'react'
import { getCourses, type Course } from '../services/api'

export default function Cursos() {
  const [cursos, setCursos] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getCourses()
        setCursos(data)
      } catch (err) {
        console.error('Error loading courses:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Nuestros cursos</h1>
      <p className="mt-2 text-brand-black/70">Atendemos 24/7 • Cupos limitados por curso</p>
      {loading ? (
        <p className="mt-6">Cargando cursos...</p>
      ) : cursos.length === 0 ? (
        <p className="mt-6 text-brand-black/70">Aún no hay cursos publicados.</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => (
            <article key={c.id} className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lg transition-shadow">
              {c.image_url && (
                <img src={c.image_url} alt={c.title} className="w-full h-40 object-cover rounded-xl mb-4" />
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-serif text-xl flex-1">{c.title}</h3>
                {c.level && <span className="badge-role-student text-xs">{c.level}</span>}
              </div>
              <p className="text-sm text-brand-black/70 mb-3">{c.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-brand-black/60">
                {c.duration && <span>⏱️ {c.duration}</span>}
                {c.modality && <span>📍 {c.modality}</span>}
                {c.price && <span className="font-semibold text-brand-purple">${c.price}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
