export default function Pago() {
  return (
    <main className="container-padded py-12">
      <h1 className="text-4xl font-extrabold">Pago</h1>
      <div className="mt-6 grid md:grid-cols-2 gap-6 items-center bg-white rounded-2xl p-6 shadow-soft">
        <div>
          <p className="text-brand-black/80">Escanea el QR para pagar tus cursos o mensualidades.</p>
          <ul className="mt-3 text-sm text-brand-black/70 list-disc pl-5">
            <li>HTTPS activo</li>
            <li>Confirmación inmediata</li>
          </ul>
        </div>
        <div className="aspect-square bg-brand-yellow rounded-xl" />
      </div>
    </main>
  )
}
