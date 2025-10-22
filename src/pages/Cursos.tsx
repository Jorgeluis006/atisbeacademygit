export default function Cursos() {
  const cursos = [
    'Inglés','Francés','Español para extranjeros','Club Conversacional','ConversArte','Tour Cafetero','Cursos para niños','Clases personalizadas'
  ]
  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Nuestros cursos</h1>
      <p className="mt-2 text-brand-black/70">Atendemos 24/7 • Cupos limitados por curso</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((c) => (
          <article key={c} className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="font-serif text-xl">{c}</h3>
            <p className="text-sm text-brand-black/70 mt-1">Descripción breve del curso.</p>
          </article>
        ))}
      </div>
    </main>
  )
}
