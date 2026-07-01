// app/dashboard/instructor/loading.tsx — Skeleton del panel de instructor
export default function InstructorLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header con botón */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="skeleton skeleton-light dark:skeleton h-8 w-64 rounded-xl" />
          <div className="skeleton skeleton-light dark:skeleton h-4 w-96 rounded-lg" />
        </div>
        <div className="skeleton skeleton-light dark:skeleton h-10 w-36 rounded-xl shrink-0" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
            <div className="skeleton skeleton-light dark:skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton skeleton-light dark:skeleton h-7 w-16 rounded-lg" />
            <div className="skeleton skeleton-light dark:skeleton h-3 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Cursos list */}
      <div className="space-y-4">
        <div className="skeleton skeleton-light dark:skeleton h-5 w-28 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-center gap-4">
              <div className="skeleton skeleton-light dark:skeleton h-14 w-20 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton skeleton-light dark:skeleton h-4 w-3/4 rounded" />
                <div className="skeleton skeleton-light dark:skeleton h-3 w-1/2 rounded" />
                <div className="flex gap-2">
                  <div className="skeleton skeleton-light dark:skeleton h-5 w-20 rounded-full" />
                  <div className="skeleton skeleton-light dark:skeleton h-5 w-16 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="skeleton skeleton-light dark:skeleton h-8 w-8 rounded-lg" />
                <div className="skeleton skeleton-light dark:skeleton h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
