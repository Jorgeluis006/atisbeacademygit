export default function Influencers() {
  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Landing pages para influencers</h1>
      <p className="mt-2 text-brand-black/70">Plantillas personalizadas para campañas con embajadores e influencers.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {[1,2,3,4].map((i) => (
          <article key={i} className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="font-serif text-xl">Campaña #{i}</h3>
            <p className="text-sm text-brand-black/70">Código de seguimiento y contenido personalizado.</p>
          </article>
        ))}
      </div>
    </main>
  )
}
