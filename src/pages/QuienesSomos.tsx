export default function QuienesSomos() {
  return (
    <main className="bg-gradient-to-b from-white via-purple-50/20 to-white">
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
          <div className="bg-brand-beige rounded-2xl p-8 md:p-12 shadow-lg mb-12 border-l-4 border-brand-purple">
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
                  📖
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
                  ⭐
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
          <div className="bg-brand-beige rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Nuestros valores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
              {[
                { 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                  title: 'Cercana', 
                  color: 'from-purple-500 to-purple-600' 
                },
                { 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  title: 'Alegre', 
                  color: 'from-pink-500 to-pink-600' 
                },
                { 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  title: 'Disciplinada', 
                  color: 'from-amber-500 to-amber-600' 
                },
                { 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                  title: 'Motivadora', 
                  color: 'from-blue-500 to-blue-600' 
                },
                { 
                  icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
                  title: 'Flexible', 
                  color: 'from-green-500 to-green-600' 
                }
              ].map((value, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 bg-gradient-to-br ${value.color} rounded-full flex items-center justify-center text-white shadow-md`}>
                    {value.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{value.title}</h3>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
