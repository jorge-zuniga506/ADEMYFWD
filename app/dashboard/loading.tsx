// app/dashboard/loading.tsx — Skeleton del Dashboard principal
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col gap-3 border-r border-zinc-200 dark:border-zinc-800 p-5">
        {/* Avatar + nombre */}
        <div className="flex items-center gap-3 mb-4">
          <div className="skeleton skeleton-light dark:skeleton h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton skeleton-light dark:skeleton h-3 w-24 rounded" />
            <div className="skeleton skeleton-light dark:skeleton h-2 w-16 rounded" />
          </div>
        </div>

        {/* Nav items */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2">
            <div className="skeleton skeleton-light dark:skeleton h-4 w-4 rounded" />
            <div className="skeleton skeleton-light dark:skeleton h-3 rounded" style={{ width: `${55 + Math.random() * 30}%` }} />
          </div>
        ))}
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="skeleton skeleton-light dark:skeleton h-8 w-64 rounded-xl" />
          <div className="skeleton skeleton-light dark:skeleton h-4 w-96 rounded-lg" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
              <div className="skeleton skeleton-light dark:skeleton h-9 w-9 rounded-xl" />
              <div className="skeleton skeleton-light dark:skeleton h-7 w-20 rounded-lg" />
              <div className="skeleton skeleton-light dark:skeleton h-3 w-28 rounded" />
            </div>
          ))}
        </div>

        {/* Content block */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wide card */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div className="skeleton skeleton-light dark:skeleton h-5 w-40 rounded-lg" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton skeleton-light dark:skeleton h-10 w-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton skeleton-light dark:skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton skeleton-light dark:skeleton h-2 w-1/2 rounded" />
                </div>
                <div className="skeleton skeleton-light dark:skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>

          {/* Narrow card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div className="skeleton skeleton-light dark:skeleton h-5 w-32 rounded-lg" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton skeleton-light dark:skeleton h-2.5 w-full rounded" />
                <div className="skeleton skeleton-light dark:skeleton h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
