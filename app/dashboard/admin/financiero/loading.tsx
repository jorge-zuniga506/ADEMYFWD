// app/dashboard/admin/financiero/loading.tsx — Skeleton del panel financiero
export default function FinancieroLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="skeleton skeleton-light dark:skeleton h-8 w-56 rounded-xl" />
        <div className="skeleton skeleton-light dark:skeleton h-4 w-80 rounded-lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
            <div className="skeleton skeleton-light dark:skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton skeleton-light dark:skeleton h-7 w-24 rounded-lg" />
            <div className="skeleton skeleton-light dark:skeleton h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      {/* Monitoreo de Servicios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SMTP Gmail */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
          <div className="skeleton skeleton-light dark:skeleton h-5 w-32 rounded-lg" />
          <div className="skeleton skeleton-light dark:skeleton h-4 w-40 rounded" />
          <div className="flex items-end gap-4">
            <div className="skeleton skeleton-light dark:skeleton h-14 w-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton skeleton-light dark:skeleton h-2.5 w-full rounded-full" />
              <div className="flex justify-between">
                <div className="skeleton skeleton-light dark:skeleton h-3 w-20 rounded" />
                <div className="skeleton skeleton-light dark:skeleton h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* LLMs */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
          <div className="skeleton skeleton-light dark:skeleton h-5 w-36 rounded-lg" />
          <div className="skeleton skeleton-light dark:skeleton h-12 w-16 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="skeleton skeleton-light dark:skeleton h-3 w-32 rounded" />
                <div className="skeleton skeleton-light dark:skeleton h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de retiros */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="skeleton skeleton-light dark:skeleton h-5 w-44 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
            <div className="skeleton skeleton-light dark:skeleton h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton skeleton-light dark:skeleton h-3.5 w-40 rounded" />
              <div className="skeleton skeleton-light dark:skeleton h-2.5 w-24 rounded" />
            </div>
            <div className="skeleton skeleton-light dark:skeleton h-5 w-16 rounded-full shrink-0" />
            <div className="skeleton skeleton-light dark:skeleton h-6 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
