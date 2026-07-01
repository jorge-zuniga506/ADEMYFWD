import { createClient } from "@/lib/supabase/server";
import { BarChart3, BookOpen, Users, DollarSign, Star, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function InstructorMetricsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cursos } = await supabase
    .from("Course")
    .select("id, titulo, precio, estado, User!inner(nombre)")
    .eq("instructorId", user!.id);

  const courseIds = (cursos ?? []).map((c) => c.id);
  
  const { data: enrollments } = courseIds.length > 0
    ? await supabase
        .from("Enrollment")
        .select("courseId, progreso, Course!inner(titulo, precio, instructorId)")
        .in("courseId", courseIds)
    : { data: [] };

  const { data: reviews } = courseIds.length > 0
    ? await supabase
        .from("CourseReview")
        .select("estrellas")
        .in("courseId", courseIds)
    : { data: [] };

  const { data: transactions } = courseIds.length > 0
    ? await supabase
        .from("Transaction")
        .select("cantidad, fecha")
        .in("courseId", courseIds)
    : { data: [] };

  const totalEstudiantes = enrollments?.length ?? 0;
  const totalCursos = cursos?.length ?? 0;
  
  // Total Earnings
  const ingresos = cursos?.reduce((sum, c) => sum + (c.precio ?? 0) * (enrollments ?? []).filter((e) => e.courseId === c.id).length, 0) ?? 0;

  // Monthly Earnings (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTransactions = transactions?.filter(t => new Date(t.fecha) >= thirtyDaysAgo) ?? [];
  const earningsMonth = recentTransactions.reduce((sum, t) => sum + t.cantidad, 0);

  // Average Star Rating
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.estrellas, 0) / reviews.length
    : 5.0;

  // Render a mock chart data for visualization styling if no real transactions exist yet
  const chartDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayStr = d.toLocaleDateString("es-ES", { weekday: "short" });
    const dayDate = d.toDateString();
    
    // Find amount from transactions
    const amount = transactions?.filter(t => new Date(t.fecha).toDateString() === dayDate)
      .reduce((sum, t) => sum + t.cantidad, 0) ?? 0;

    return { label: dayStr, amount };
  });

  const maxAmount = Math.max(...chartDays.map(d => d.amount), 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Panel de Instructor</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Supervisa el rendimiento de tu catálogo de cursos y tus ingresos financieros.
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Cursos */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Cursos Creados</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{totalCursos}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <BookOpen className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Estudiantes */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Alumnos Nuevos</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{totalEstudiantes}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Ganancias 30 días */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Ganancias del Mes (30d)</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${earningsMonth.toFixed(2)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Calificación Promedio */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Calificación Promedio</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{avgRating.toFixed(1)}</p>
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Star className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Sección Gráfica y Cursos */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Ventas Semanal */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Gráfico de Ventas Recientes</h3>
              <p className="text-xs text-zinc-500">Ingresos acumulados en los últimos 7 días</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Tiempo real
            </span>
          </div>

          <div className="flex h-48 items-end justify-between gap-2 pt-4">
            {chartDays.map((d, index) => {
              const pct = (d.amount / maxAmount) * 100;
              return (
                <div key={index} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-8 scale-0 rounded bg-zinc-900 px-2 py-1 text-[10px] text-white transition-all group-hover:scale-100 dark:bg-zinc-800">
                      ${d.amount.toFixed(2)}
                    </span>
                    <div 
                      style={{ height: `${Math.max(pct, 5)}%` }} 
                      className={`w-8 rounded-t-lg transition-all duration-500 ${
                        d.amount > 0 
                          ? 'bg-gradient-to-t from-primary-600 to-primary-400 dark:from-primary-700 dark:to-primary-500' 
                          : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase">{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lista de Cursos */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 font-sans">Gestor de Cursos</h3>
            <Link 
              href="/dashboard/instructor/crear" 
              className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Crear nuevo +
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[220px]">
            {cursos?.map((curso) => {
              const isDraft = curso.estado === "BORRADOR";
              const isReview = curso.estado === "EN_REVISION";
              const isPublished = curso.estado === "PUBLICADO";

              return (
                <Link
                  key={curso.id}
                  href={`/dashboard/instructor/${curso.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 p-3 transition hover:border-primary-200 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:border-primary-900 dark:hover:bg-zinc-800/40"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{curso.titulo}</p>
                    <p className="text-xs text-zinc-500">${curso.precio.toFixed(2)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    isPublished 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                      : isReview 
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' 
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {curso.estado}
                  </span>
                </Link>
              );
            })}
            {(!cursos || cursos.length === 0) && (
              <p className="py-12 text-center text-xs text-zinc-400">
                No tienes ningún curso creado. ¡Comienza a enseñar hoy mismo!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

