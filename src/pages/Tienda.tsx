export default function Tienda() {
  const products = [
    { name: 'Curso pregrabado: Inglés', price: '$', tag: 'curso' },
    { name: 'Curso pregrabado: Francés', price: '$', tag: 'curso' },
    { name: 'Libro/PDF Gramática', price: '$', tag: 'material' },
    { name: 'Club de lectura', price: '$', tag: 'club' },
    { name: 'Taller temático', price: '$', tag: 'taller' },
  ]
  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Tienda virtual</h1>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <article key={p.name} className="bg-white rounded-2xl p-6 shadow-soft">
            <h3 className="font-serif text-xl">{p.name}</h3>
            <p className="text-sm text-brand-black/70 mt-1">{p.tag}</p>
            <button className="btn-primary mt-4">Comprar</button>
          </article>
        ))}
      </div>
    </main>
  )
}
