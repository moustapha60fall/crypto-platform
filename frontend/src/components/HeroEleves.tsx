export default function HeroEleves() {
  return (
    <section className="relative bg-green-200 border-b border-slate-200 py-16 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Contenu principal */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
            Maîtrise la cryptographie, étape par étape
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Apprends les bases des systèmes cryptographiques, explore les primitives comme le chiffrement, le hachage et la signature, et découvre les services de sécurité qu’ils garantissent.
          </p>
        </div>
      </div>
    </section>
  );
}
