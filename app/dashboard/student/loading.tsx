// app/dashboard/student/loading.tsx — Skeleton del panel de estudiante
export default function StudentLoading() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="skeleton skeleton-light dark:skeleton h-8 w-56 rounded-xl" />
        <div className="skeleton skeleton-light dark:skeleton h-4 w-80 rounded-lg" />
      </div>

      {/* Progress bar de racha */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-center gap-5">
        <div className="skeleton skeleton-light dark:skeleton h-14 w-14 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton skeleton-light dark:skeleton h-4 w-48 rounded-lg" />
          <div className="skeleton skeleton-light dark:skeleton h-2 w-full rounded-full" />
        </div>
        <div className="skeleton skeleton-light dark:skeleton h-9 w-24 rounded-xl shrink-0" />
      </div>

      {/* Mis cursos grid */}
      <div className="space-y-4">
        <div className="skeleton skeleton-light dark:skeleton h-5 w-32 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              {/* Thumbnail */}
              <div className="skeleton skeleton-light dark:skeleton h-36 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <div className="skeleton skeleton-light dark:skeleton h-4 w-4/5 rounded" />
                <div className="skeleton skeleton-light dark:skeleton h-3 w-3/5 rounded" />
                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <div className="skeleton skeleton-light dark:skeleton h-2.5 w-16 rounded" />
                    <div className="skeleton skeleton-light dark:skeleton h-2.5 w-8 rounded" />
                  </div>
                  <div className="skeleton skeleton-light dark:skeleton h-1.5 w-full rounded-full" />
                </div>
                <div className="skeleton skeleton-light dark:skeleton h-8 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
