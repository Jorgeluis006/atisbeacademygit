import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Corporativo() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const section = params.get('section') || ''

  const cards = [
    {
      key: 'empresariales',
      title: 'Cursos empresariales',
      description:
        'Curso de estudio de manera presencial en casa u oficina de los estudiantes. Las clases se desarrollan a partir del estilo de aprendizaje preferido de los estudiantes, con apoyo de contenidos programáticos cuidadosamente elegidos y de acuerdo al idioma a aprender con enfoque a negocios o interacción general.',
      image: '/images/B2.png',
      prefill: { curso: 'Cursos empresariales' }
    },
    {
      key: 'colegios',
      title: 'Cursos en colegios',
      description:
        'Nuestros cursos de inglés en colegios apoyan a instituciones educativas que desean llevar a sus estudiantes hacia el bilingüismo desde primaria hasta bachillerato, a través de cursos extra curriculares que facilitan la práctica del inglés como lengua extranjera.',
      image: '/images/B1.png',
      prefill: { curso: 'Cursos en colegios' }
    },
    {
      key: 'personalizado',
      title: 'Personalizado',
      description:
        'Nuestros cursos presenciales y virtuales con profesor privado permiten a los estudiantes abrir puertas e incrementar sus aptitudes laborales y visión frente al futuro.',
      image: '/images/A2.png',
      prefill: { curso: 'Curso personalizado', modalidad: 'virtual' }
    }
  ]

  function comenzar(prefill: Partial<Record<string, string>>) {
    const entries = Object.entries(prefill).filter(([, v]) => typeof v === 'string' && v.length > 0) as [string, string][]
    const qs = new URLSearchParams(entries).toString()
    navigate(`/contacto?${qs}`)
  }

  return (
    <main className="bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-12 sm:py-16">
        <div className="container-padded text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 uppercase">Corporativo</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-4xl mx-auto">
            Nuestros cursos presenciales y en línea con docente privado permiten a los estudiantes abrir puertas e incrementar sus aptitudes laborales y visión frente al futuro.
          </p>
        </div>
      </div>

      <div className="container-padded py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(c => (
            <article key={c.key} className={`bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 ${section===c.key ? 'ring-2 ring-brand-purple' : ''}`}>
              <div className="w-full aspect-[16/9] bg-gray-50 overflow-hidden">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3">{c.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{c.description}</p>
                <button onClick={() => comenzar(c.prefill)} className="bg-brand-purple hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-xl">
                  Comenzar
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
