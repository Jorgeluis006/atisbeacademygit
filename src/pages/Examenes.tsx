import { useNavigate } from 'react-router-dom'

const exams = [
  {
    id: 'ielts',
    title: 'IELTS',
    description: 'Prepara tu examen IELTS con estrategias, simulacros y acompañamiento personalizado para alcanzar la banda que necesitas.',
    image: '/images/A1.png',
  },
  {
    id: 'toefl',
    title: 'TOEFL',
    description: 'Entrenamiento integral para TOEFL con prácticas de Reading, Listening, Speaking y Writing, y retroalimentación experta.',
    image: '/images/B2.png',
  },
]

export default function Examenes() {
  const navigate = useNavigate()
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <article
              key={e.id}
              onClick={() => navigate(`/examenes/${e.id}`)}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 cursor-pointer"
              aria-label={`Ver detalles de ${e.title}`}
            >
              <div className="w-full aspect-[16/9] bg-gray-50 overflow-hidden">
                <img src={e.image} alt={e.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">{e.title}</h3>
                <p className="text-gray-600 leading-relaxed">{e.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
