import { useParams } from 'react-router-dom'

const examData: Record<string, { title: string; description: string; image: string }> = {
  ielts: {
    title: 'IELTS',
    description:
      'Programa enfocado en alcanzar tu banda objetivo. Simulacros cronometrados, feedback en Speaking y Writing y estrategias para Listening y Reading.',
    image: '/images/A2.png',
  },
  toefl: {
    title: 'TOEFL',
    description:
      'Preparación intensiva para TOEFL. Mejora tus habilidades con ejercicios reales, rúbricas oficiales y seguimiento personalizado.',
    image: '/images/B1.png',
  },
}

export default function ExamenDetalle() {
  const { id } = useParams()
  const exam = (id && examData[id]) || {
    title: 'Examen',
    description: 'Detalles próximamente.',
    image: '/images/A1.png',
  }

  return (
    <main className="bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-16">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 uppercase">{exam.title}</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">{exam.description}</p>
        </div>
      </div>

      <div className="container-padded py-12">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="w-full aspect-[16/9] bg-gray-50 overflow-hidden">
            <img src={exam.image} alt={exam.title} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-3">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">
              {exam.description}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
