import { useState } from 'react'
import { Link } from 'react-router-dom'

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: '¿Cómo me inscribo a un curso?',
    answer: 'Elige el curso que más te interese en la sección Cursos, revisa sus modalidades y escríbenos por WhatsApp para confirmar tu cupo.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos pago por QR. Escríbenos por WhatsApp indicando el curso o producto y te enviamos el código para pagar desde tu app bancaria.',
  },
  {
    question: '¿Cómo accedo a la Zona de Estudiantes?',
    answer: 'Una vez confirmado tu pago, te enviamos por WhatsApp tu usuario y contraseña para ingresar a la Zona de Estudiantes y agendar tus clases.',
  },
  {
    question: '¿Puedo cambiar mi horario de clase?',
    answer: 'Sí. Puedes cancelar una reserva desde la Zona de Estudiantes y agendar un nuevo horario disponible, sujeto a la disponibilidad del profesor.',
  },
  {
    question: '¿Ofrecen clases virtuales y presenciales?',
    answer: 'Sí, contamos con ambas modalidades. Puedes elegir la que prefieras al momento de agendar tu clase.',
  },
  {
    question: '¿Qué exámenes de certificación preparan?',
    answer: 'Preparamos para distintos exámenes de idiomas. Revisa la sección Exámenes para ver el detalle de cada uno.',
  },
  {
    question: '¿Cómo los contacto si tengo más dudas?',
    answer: 'Puedes escribirnos desde la sección Contacto o directamente por WhatsApp; te respondemos en menos de 5 minutos en horario de atención.',
  },
]

export default function PreguntasFrecuentes() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <main className="min-h-screen bg-brand-beige">
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-16">
        <div className="container-padded text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Preguntas frecuentes</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestros cursos, pagos y clases
          </p>
        </div>
      </div>

      <div className="container-padded py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 text-brand-purple transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-gray-600 mb-4">¿No encontraste lo que buscabas?</p>
          <Link to="/contacto" className="btn-primary inline-flex">Contáctanos</Link>
        </div>
      </div>
    </main>
  )
}
