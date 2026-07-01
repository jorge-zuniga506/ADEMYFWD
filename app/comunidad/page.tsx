import { MessageSquare, Calendar, Disc, Globe, Compass, ArrowUpRight } from "lucide-react";

export default function ComunidadPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans px-6 py-12 dark">
      <div className="mx-auto max-w-4xl space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Comunidad U-Forward
          </h1>
          <p className="text-sm text-zinc-400">
            Conecta, comparte código y construye soluciones en equipo junto a cientos de graduados y mentores técnicos.
          </p>
        </div>

        {/* Community Channels */}
        <div className="grid gap-6 sm:grid-cols-2 pt-6">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 flex flex-col justify-between hover:border-zinc-800 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400">
                  <Disc className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">Servidor de Discord</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Únete a los canales de chat por especialidad, soporte técnico en vivo, reclutamientos y avisos de la comunidad.
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white transition-colors">
              Unirse al Servidor
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 flex flex-col justify-between hover:border-zinc-800 transition-all">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-base text-white">Eventos & Hackathons</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Participa en mentorías grupales, desafíos semanales de código y proyectos colaborativos interdisciplinarios.
              </p>
            </div>
            <button className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-white transition-colors border border-zinc-800">
              Ver Calendario
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Global stats */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 text-center space-y-2">
          <Globe className="mx-auto h-6 w-6 text-purple-400" />
          <h4 className="font-bold text-sm text-white">Red de Trabajo de U-Forward</h4>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            El 82% de nuestros alumnos egresados logran conectar con vacantes del ecosistema VIP en los primeros 3 meses de su graduación.
          </p>
        </div>

      </div>
    </div>
  );
}
