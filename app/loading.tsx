// app/loading.tsx — Pantalla de carga global (landing, cursos, etc.)
export default function RootLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6">
      {/* Logo animado */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-600/20 to-pink-500/20 animate-ping" />
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
          <img
            src="/images/ademy-logo.png"
            alt="U-Forward"
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Nombre de marca */}
      <div className="text-center space-y-1">
        <p className="text-white font-bold text-lg tracking-tight">U-Forward Academy</p>
        <p className="text-zinc-500 text-xs font-medium">Cargando plataforma...</p>
      </div>

      {/* Barra de progreso animada */}
      <div className="w-48 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full animate-[loading-bar_1.4s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-150%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}
