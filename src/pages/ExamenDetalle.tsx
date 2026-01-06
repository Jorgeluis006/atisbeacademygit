import { useParams } from 'react-router-dom'
import ExamInquiryForm from '../components/ExamInquiryForm'

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
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-12 sm:py-16">
        <div className="container-padded">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 sm:mb-4 uppercase">{exam.title}</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-4xl">{exam.description}</p>
        </div>
      </div>

      <div className="container-padded py-10">
        <div className="max-w-6xl mx-auto grid gap-6 sm:gap-10 md:grid-cols-[360px,1fr] items-start">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="w-full aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] bg-gray-50 overflow-hidden">
              <img src={exam.image} alt={exam.title} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-2xl font-bold mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">{exam.description}</p>
            </div>
            <ExamInquiryForm exam={exam.title} />
          </div>
        </div>
      </div>
    </main>
  )
}
