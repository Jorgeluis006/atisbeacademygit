export default function Testimonios() {
  const items = [
    { name: 'Ana Valeria Oviedo', text: 'Excelente experiencia y resultados rápidos.' },
    { name: 'Ana Lucía', text: 'Profes y método geniales.' },
    { name: 'Ana María Rincón', text: 'Me sentí acompañada en todo momento.' },
  ]
  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Testimonios reales</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {items.map((t) => (
          <article key={t.name} className="bg-white rounded-2xl p-6 shadow-soft">
            <div className="w-12 h-12 rounded-full bg-brand-pink/60 mb-3" />
            <p className="text-brand-black/80">“{t.text}”</p>
            <div className="mt-2 text-sm text-brand-black/60">{t.name}</div>
          </article>
        ))}
      </div>
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
