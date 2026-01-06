import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ExamInquiryForm from '../components/ExamInquiryForm'
import { getExam, type Exam } from '../services/api'

// data will be fetched from API

export default function ExamenDetalle() {
  const { id } = useParams()
  const [exam, setExam] = useState<Exam | null>(null)

  useEffect(() => {
    (async () => {
      if (!id) return
      try { const data = await getExam(id); setExam(data) } catch { setExam(null) }
    })()
  }, [id])

  return (
    <main className="bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-12 sm:py-16">
        <div className="container-padded">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 sm:mb-4 uppercase">{exam?.title || 'Examen'}</h1>
        </div>
      </div>

      <div className="container-padded py-10">
        <div className="max-w-6xl mx-auto grid gap-6 sm:gap-10 md:grid-cols-[520px,1fr] lg:grid-cols-[600px,1fr] items-start">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex items-center justify-center h-[300px] sm:h-[360px] md:h-[420px] lg:h-[520px] xl:h-[580px]">
            <img src={exam?.image_url || '/images/A1.png'} alt={exam?.title || 'Examen'} className="w-full h-full object-contain" />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sm:p-6">
              <h2 className="text-2xl font-bold mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">{exam?.detail_description || exam?.description || 'Detalles próximamente.'}</p>
            </div>
            <ExamInquiryForm exam={exam?.title || 'Examen'} />
          </div>
        </div>
      </div>
    </main>
  )
}
