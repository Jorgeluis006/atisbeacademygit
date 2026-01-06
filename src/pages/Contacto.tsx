import { useSearchParams } from 'react-router-dom'
import ContactForm from '../components/ContactForm'

export default function Contacto() {
  const [searchParams] = useSearchParams()
  const prefill = {
    curso: searchParams.get('curso') || '',
    modalidad: searchParams.get('modalidad') || ''
  }

  return (
    <main className="bg-brand-beige">
      {/* Hero header to match QuiénesSomos */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-16 sm:py-20">
        <div className="container-padded text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">Contacto</h1>
        </div>
      </div>

      {/* Form section without duplicated title */}
      <ContactForm title="" prefill={prefill} />
    </main>
  )
}
