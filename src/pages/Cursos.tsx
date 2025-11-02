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
    <main className="bg-gradient-to-b from-white via-purple-50/20 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            Nuestros cursos
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Atendemos 24/7 • Cupos limitados por curso
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-padded py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-xl text-gray-500">Cargando cursos...</p>
          </div>
        ) : cursos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Aún no hay cursos publicados.</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((c) => (
            <article key={c.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              {c.image_url && (
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center p-4">
                  <img src={c.image_url} alt={c.title} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-2xl font-bold text-gray-900 flex-1">{c.title}</h3>
                  {c.level && <span className="px-3 py-1 bg-brand-purple text-white text-xs font-semibold rounded-full">{c.level}</span>}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{c.description}</p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                  {c.duration && (
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{c.duration}</span>
                    </div>
                  )}
                  {c.modality && (
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{c.modality}</span>
                    </div>
                  )}
                </div>
                {c.price && (
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-brand-purple">${c.price}</span>
                    <span className="text-gray-500 text-sm ml-1">/ curso</span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
        )}
      </div>
    </main>
  )
}
