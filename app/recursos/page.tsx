import { FileText, Download, Code, ExternalLink, Database, ShieldAlert } from "lucide-react";

const resources = [
  {
    title: "Boilerplate Docker Compose",
    description: "Configuración multi-contenedor lista para producción con NodeJS, PostgreSQL, Redis y Nginx configurados para SSL.",
    category: "DevOps",
    size: "14 KB",
    icon: Code,
  },
  {
    title: "Prisma Schema & Postgres Cheatsheet",
    description: "Guía rápida de modelado, tipos complejos de relaciones, indexes y optimización de queries SQL en bases de datos.",
    category: "Backend",
    size: "1.2 MB",
    icon: Database,
  },
  {
    title: "Tailwind UI & Framer Motion Boilerplate",
    description: "Plantilla inicial para proyectos de Next.js configurada con Tailwind CSS, Framer Motion y animaciones 3D fluidas.",
    category: "Frontend",
    size: "45 KB",
    icon: FileText,
  },
  {
    title: "Guía de Seguridad RLS en Supabase",
    description: "Manual detallado para configurar Row Level Security (RLS) y políticas seguras anti-inyecciones en tus tablas públicas.",
    category: "Seguridad",
    size: "512 KB",
    icon: ShieldAlert,
  },
];

export default function RecursosPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans px-6 py-12 dark">
      <div className="mx-auto max-w-4xl space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Recursos Descargables
          </h1>
          <p className="text-sm text-zinc-400">
            Plantillas iniciales, boilerplates de código y hojas de atajos técnicos listos para clonar y utilizar en tus proyectos.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-4 pt-6 sm:grid-cols-2">
          {resources.map((res, idx) => {
            const Icon = res.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between gap-4 hover:border-zinc-800 hover:scale-[1.01] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      {res.category}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono font-medium">{res.size}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm text-white group-hover:text-purple-400 transition-colors">
                      {res.title}
                    </h3>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{res.description}</p>
                </div>

                <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 px-4 py-2.5 text-xs font-bold text-white transition-colors border border-zinc-800">
                  <Download className="h-3.5 w-3.5" />
                  Descargar Recurso
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
