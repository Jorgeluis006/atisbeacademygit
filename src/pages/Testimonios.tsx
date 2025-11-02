import { useEffect, useState } from 'react'
import { getTestimonials, type Testimonial } from '../services/api'

export default function Testimonios() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getTestimonials()
        setItems(data)
      } catch (err) {
        console.error('Error loading testimonials:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Testimonios reales</h1>
      {loading ? (
        <p className="mt-6">Cargando testimonios...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-brand-black/70">Aún no hay testimonios publicados.</p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {items.map((t) => (
            <article key={t.id} className="bg-white rounded-2xl p-6 shadow-soft">
              {t.image_url ? (
                <img src={t.image_url} alt={t.author_name} className="w-12 h-12 rounded-full object-cover mb-3" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-brand-pink/60 mb-3 flex items-center justify-center text-white font-bold">
                  {t.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: t.rating || 5 }).map((_, i) => (
                  <span key={i} className="text-brand-amber">★</span>
                ))}
              </div>
              <p className="text-brand-black/80">"{t.content}"</p>
              <div className="mt-3">
                <div className="font-semibold text-brand-black">{t.author_name}</div>
                {t.author_role && <div className="text-sm text-brand-black/60">{t.author_role}</div>}
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="mt-10">
        <h2 className="font-serif text-2xl">Videos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="aspect-video rounded-xl bg-brand-black/10" />
          ))}
        </div>
      </div>
    </main>
  )
}
