// app/cursos/loading.tsx — Skeleton del catálogo de cursos público
export default function CursosLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 py-16 px-4">
      {/* Hero section skeleton */}
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="text-center space-y-4">
          <div className="skeleton h-10 w-72 rounded-2xl mx-auto" />
          <div className="skeleton h-5 w-96 rounded-xl mx-auto" />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-20 rounded-full" style={{ width: `${55 + i * 10}px` }} />
          ))}
        </div>

        {/* Grid de cursos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              {/* Thumbnail */}
              <div className="skeleton h-44 w-full rounded-none" />
              <div className="p-4 space-y-3">
                {/* Tags */}
                <div className="flex gap-2">
                  <div className="skeleton h-4 w-16 rounded-full" />
                  <div className="skeleton h-4 w-12 rounded-full" />
                </div>
                {/* Título */}
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-4/5 rounded" />
                {/* Instructor */}
                <div className="flex items-center gap-2">
                  <div className="skeleton h-6 w-6 rounded-full shrink-0" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                {/* Precio y rating */}
                <div className="flex items-center justify-between pt-1">
                  <div className="skeleton h-6 w-16 rounded-lg" />
                  <div className="skeleton h-4 w-12 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
