// app/dashboard/admin/loading.tsx — Skeleton del panel de administración
export default function AdminLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="skeleton skeleton-light dark:skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton skeleton-light dark:skeleton h-4 w-72 rounded-lg" />
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
            <div className="skeleton skeleton-light dark:skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton skeleton-light dark:skeleton h-7 w-20 rounded-lg" />
            <div className="skeleton skeleton-light dark:skeleton h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Tabla / lista de cursos */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton skeleton-light dark:skeleton h-5 w-36 rounded-lg" />
          <div className="skeleton skeleton-light dark:skeleton h-8 w-24 rounded-xl" />
        </div>
        {/* Table header */}
        <div className="flex items-center gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          {[40, 20, 15, 15, 10].map((w, i) => (
            <div key={i} className="skeleton skeleton-light dark:skeleton h-3 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-1">
            <div className="skeleton skeleton-light dark:skeleton h-10 w-10 rounded-xl shrink-0" style={{ width: "40px" }} />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton skeleton-light dark:skeleton h-3.5 w-3/4 rounded" />
              <div className="skeleton skeleton-light dark:skeleton h-2.5 w-1/2 rounded" />
            </div>
            <div className="skeleton skeleton-light dark:skeleton h-5 w-20 rounded-full shrink-0" />
            <div className="skeleton skeleton-light dark:skeleton h-5 w-16 rounded-full shrink-0" />
            <div className="flex gap-1.5 shrink-0">
              <div className="skeleton skeleton-light dark:skeleton h-7 w-7 rounded-lg" />
              <div className="skeleton skeleton-light dark:skeleton h-7 w-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Monitoreo de servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div className="skeleton skeleton-light dark:skeleton h-5 w-40 rounded-lg" />
            <div className="flex items-end gap-4">
              <div className="skeleton skeleton-light dark:skeleton h-12 w-16 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton skeleton-light dark:skeleton h-2 w-full rounded-full" />
                <div className="skeleton skeleton-light dark:skeleton h-3 w-24 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
