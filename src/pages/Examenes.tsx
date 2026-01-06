import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExams, type Exam } from '../services/api'

export default function Examenes() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try { const data = await getExams(); setItems(data) } finally { setLoading(false) }
    })()
  }, [])
  return (
    <main className="bg-brand-beige">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-16">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 uppercase">Preparación de exámenes</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Te ayudamos a alcanzar la puntuación que necesitas con un plan a tu medida, simulacros y seguimiento constante.
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="container-padded py-12">
        {loading ? (
          <p>Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-600">Aún no hay exámenes publicados.</p>
        ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <article
              key={e.slug}
              onClick={() => navigate(`/examenes/${e.slug}`)}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer"
              aria-label={`Ver detalles de ${e.title}`}
            >
              <div className="w-full aspect-[16/9] bg-gray-50 overflow-hidden flex items-center justify-center">
                <img src={e.image_url || '/images/A1.png'} alt={e.title} className="w-full h-auto max-h-full object-contain" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">{e.title}</h3>
                <p className="text-gray-600 leading-relaxed">{e.detail_description || e.description}</p>
              </div>
            </article>
          ))}
        </div>
        )}
      </div>
    </main>
  )
}
