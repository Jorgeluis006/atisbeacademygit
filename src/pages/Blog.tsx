export default function Blog() {
  const posts = [
    { title: 'Cómo prepararte para el IELTS', slug: 'ielts' },
    { title: '5 tips para que tus hijos amen los idiomas', slug: 'tips-hijos' },
    { title: 'Ejercicios de gramática prácticos', slug: 'gramatica' },
  ]
  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Blog</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <article key={p.slug} className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="font-serif text-xl">{p.title}</h3>
            <p className="text-sm text-brand-black/70 mt-2">Próximamente...</p>
          </article>
        ))}
      </div>
    </main>
  )
}
