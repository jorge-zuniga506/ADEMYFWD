import { Map, Layers, Database, Code, Compass, ArrowRight } from "lucide-react";

const paths = [
  {
    title: "Especialización Frontend",
    description: "Domina la interfaz de usuario. Desde maquetación básica hasta aplicaciones dinámicas con Next.js y animaciones tridimensionales.",
    icon: Code,
    color: "from-purple-500 to-pink-500",
    glow: "rgba(168,85,247,0.15)",
    steps: ["Fundamentos de HTML, CSS y Javascript moderno", "Maquetación Responsive & Tailwind CSS", "Componentes dinámicos con React y TypeScript", "Arquitectura e inmersión web con Next.js"],
  },
  {
    title: "Especialización Backend",
    description: "Diseña lógica, base de datos y APIs robustas capaces de escalar para miles de usuarios simultáneos en producción.",
    icon: Database,
    color: "from-cyan-500 to-blue-500",
    glow: "rgba(6,182,212,0.15)",
    steps: ["Lógica con NodeJS y programación asíncrona", "Base de datos relacionales PostgreSQL y Prisma ORM", "Autenticación segura JWT y control de roles (RBAC)", "Despliegue y optimización en servidores en la nube"],
  },
  {
    title: "Especialización DevOps",
    description: "Administra infraestructuras en la nube, automatiza procesos de integración y despliegue continuo (CI/CD).",
    icon: Layers,
    color: "from-emerald-500 to-teal-500",
    glow: "rgba(16,185,129,0.15)",
    steps: ["Administración de servidores Linux y comandos bash", "Contenedores Docker y redes de servicios", "Pipelines CI/CD automatizados (GitHub Actions)", "Orquestación en la nube (AWS/GCP) y Terraform"],
  },
];

export default function RutaPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans px-6 py-12 dark">
      <div className="mx-auto max-w-4xl space-y-12">
        
        {/* Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Rutas de Aprendizaje
          </h1>
          <p className="text-sm text-zinc-400">
            Sigue una ruta de especialización estructurada y adquiere el conocimiento técnico requerido en la industria global.
          </p>
        </div>

        {/* Career Paths Display */}
        <div className="grid gap-8 pt-6">
          {paths.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start overflow-hidden group hover:border-zinc-800 transition-all"
                style={{ boxShadow: `inset 0 0 30px ${p.glow}` }}
              >
                {/* Visual Glow */}
                <div className={`absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br ${p.color} blur-[100px] opacity-20`} />

                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${p.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">{p.title}</h3>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{p.description}</p>

                  {/* Steps Indicators */}
                  <div className="grid gap-2 pt-2">
                    {p.steps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-3 text-xs text-zinc-300">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold font-mono text-zinc-400">
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 self-stretch flex items-end justify-end md:justify-center">
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-purple-300 transition-colors uppercase tracking-wider">
                    Ver cursos
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
