export default function QuienesSomos() {
  return (
    <main className="bg-brand-beige">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-purple to-purple-600 text-white py-20">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
            Quiénes somos
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Una academia cercana que transforma vidas a través del aprendizaje de idiomas
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-padded py-16">
        <div className="max-w-5xl mx-auto">
          
          {/* Introduction Card */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-12 border-l-4 border-brand-purple">
            <p className="text-xl md:text-2xl leading-relaxed text-gray-700">
              Atisbe es una academia <span className="font-bold text-brand-purple">cercana, alegre, disciplinada, motivadora y flexible</span>. 
              Aplicamos el método ATIKA para lograr avances sostenibles paso a paso.
            </p>
          </div>

          {/* Two Column Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Origen del nombre */}
            <div className="bg-gradient-to-br from-brand-purple/5 to-purple-100/30 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-purple rounded-full flex items-center justify-center text-white text-2xl">
                  <img src="/images/value-cercana.svg" alt="Origen del nombre" className="w-6 h-6 text-white" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Origen del nombre</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Proviene de <span className="font-semibold text-brand-purple">"atisbar"</span>, 
                observar con atención; término común en Boyacá. 
                Conecta con nuestra misión de guiar y acompañar procesos de aprendizaje.
              </p>
            </div>

            {/* Método ATIKA */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-100/30 rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-brand-pink rounded-full flex items-center justify-center text-white text-2xl">
                  <img src="/images/value-motivadora.svg" alt="Método ATIKA" className="w-6 h-6 text-white" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Método ATIKA</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Enfoque <span className="font-semibold text-brand-purple">progresivo, activo y personalizado</span>.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-brand-purple text-xl">✓</span>
                  <span className="text-gray-700">Aprendizaje práctico</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-brand-purple text-xl">✓</span>
                  <span className="text-gray-700">Confianza comunicativa</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-brand-purple text-xl">✓</span>
                  <span className="text-gray-700">Acompañamiento continuo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Nuestros valores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
              {[
                { title: 'Cercana', color: 'from-purple-500 to-purple-600' },
                { title: 'Alegre', color: 'from-pink-500 to-pink-600' },
                { title: 'Disciplinada', color: 'from-amber-500 to-amber-600' },
                { title: 'Motivadora', color: 'from-blue-500 to-blue-600' },
                { title: 'Flexible', color: 'from-green-500 to-green-600' }
              ].map((value, index) => (
                <div key={index} className="text-center bg-brand-purple/5 rounded-xl p-4 min-h-[110px] flex items-center justify-center">
                  <h3 className="font-bold text-gray-900 text-lg">{value.title}</h3>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
