import { useSearchParams } from 'react-router-dom'
import ContactForm from '../components/ContactForm'

export default function Contacto() {
  const [searchParams] = useSearchParams()
  const prefill = {
    curso: searchParams.get('curso') || '',
    modalidad: searchParams.get('modalidad') || ''
  }

  return (
    <main className="bg-brand-beige py-12">
      <ContactForm title="Contacto" prefill={prefill} />
    </main>
  )
}
