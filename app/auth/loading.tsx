// app/auth/loading.tsx — Skeleton de las páginas de autenticación
export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-purple-600/30 to-pink-500/30 animate-pulse" />
            <div className="skeleton h-16 w-16 rounded-full relative" />
          </div>
        </div>

        {/* Título */}
        <div className="text-center space-y-2">
          <div className="skeleton h-7 w-48 rounded-xl mx-auto" />
          <div className="skeleton h-4 w-64 rounded-lg mx-auto" />
        </div>

        {/* Formulario */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          ))}
          <div className="skeleton h-11 w-full rounded-xl" />
        </div>

        {/* Divider */}
        <div className="skeleton h-3 w-full rounded" />

        {/* Link de registro */}
        <div className="skeleton h-4 w-48 rounded mx-auto" />
      </div>
    </div>
  );
}
