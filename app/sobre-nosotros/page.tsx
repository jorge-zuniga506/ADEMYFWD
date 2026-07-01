import { Award, ShieldCheck, Heart, Sparkles } from "lucide-react";

export default function SobreNosotrosPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans px-6 py-12 dark">
      <div className="mx-auto max-w-4xl space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Sobre Nosotros
          </h1>
          <p className="text-sm text-zinc-400">
            Conoce la visión técnica y el equipo detrás de FWD Academy. Construyendo el futuro del aprendizaje de código.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid gap-6 sm:grid-cols-3 pt-6">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-3 text-center">
            <Award className="mx-auto h-6 w-6 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Excelencia Técnica</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enfocados en los estándares modernos de desarrollo de software global.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-3 text-center">
            <Heart className="mx-auto h-6 w-6 text-pink-400" />
            <h3 className="font-bold text-sm text-white">Comunidad Activa</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              El aprendizaje no termina en la lección; el soporte mutuo es clave.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-3 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Filtros de Calidad</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cursos revisados detalladamente para garantizar que aprendas conceptos reales.
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h4 className="font-bold text-base text-white">Nuestra Historia & Misión</h4>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            FWD Academy nació como un esfuerzo conjunto dentro de la comunidad FWD para consolidar una academia técnica en línea de nivel avanzado. A diferencia de plataformas genéricas, enfocamos cada lección en resolver problemas del mundo real y en la creación de portafolios robustos listos para el mercado laboral internacional.
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Nuestros mentores son desarrolladores e ingenieros que trabajan activamente en la industria de la tecnología y aplican diariamente los estándares que enseñan.
          </p>
        </div>

      </div>
    </div>
  );
}
