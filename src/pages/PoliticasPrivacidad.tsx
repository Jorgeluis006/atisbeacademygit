export default function PoliticasPrivacidad() {
  return (
    <div className="container-padded py-16 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif font-bold mb-6">Políticas de privacidad</h1>
      <p className="mb-4">Esta página contiene las políticas de privacidad del sitio. Puedes editar este archivo en <code>src/pages/PoliticasPrivacidad.tsx</code> para poner el texto definitivo que quieras mostrar.</p>

      <section className="bg-white/5 p-6 rounded-lg">
        <h2 className="font-bold mb-2">1. Información que recogemos</h2>
        <p className="mb-4">Recogemos información que nos proporcionas directamente cuando te registras, envías formularios de contacto o reservas clases (nombre, email, teléfono, datos de pago cuando corresponda, etc.).</p>

        <h2 className="font-bold mb-2">2. Cómo usamos la información</h2>
        <p className="mb-4">Usamos la información para prestar los servicios (gestionar cursos, reservas y comunicaciones), mejorar la experiencia y cumplir obligaciones legales.</p>

        <h2 className="font-bold mb-2">3. Compartir información</h2>
        <p className="mb-4">No vendemos datos. Podemos compartir información con proveedores que nos ayudan a operar la plataforma (procesadores de pago, servicios de email, etc.).</p>

        <h2 className="font-bold mb-2">4. Tus derechos</h2>
        <p className="mb-4">Puedes solicitar acceso, rectificación o supresión de tus datos contactando con nosotros en <a href="mailto:automatic@atisbeacademy.com" className="underline">automatic@atisbeacademy.com</a>.</p>

        <p className="text-sm text-white/70">Nota: Este texto es un ejemplo. Reemplázalo por la política legal exacta que tu negocio necesite.</p>
      </section>
    </div>
  )
}
