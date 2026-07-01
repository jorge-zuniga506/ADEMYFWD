import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge } from "@/components/ui";
import {
  LayoutDashboard,
  BookOpen,
  ArrowRight,
  Trophy,
  Crown,
  Zap,
  Star,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("User")
    .select("nombre, rol")
    .eq("id", user!.id)
    .single();

  if (!perfil) redirect("/auth/onboarding");

  const { data: onboardingRow } = await supabase
    .from("User")
    .select("onboardingDone")
    .eq("id", user!.id)
    .single();

  if (onboardingRow && onboardingRow.onboardingDone === false) redirect("/auth/onboarding");

  const { data: enrollments } = await supabase
    .from("Enrollment")
    .select("id, progreso, courseId")
    .eq("userId", user.id);

  const courseIds = enrollments?.map((e) => e.courseId) ?? [];
  const { data: enrolledCourses } = courseIds.length > 0
    ? await supabase
        .from("Course")
        .select("id, titulo")
        .in("id", courseIds)
    : { data: [] };

  const promedio =
    enrollments && enrollments.length > 0
      ? Math.round(
          enrollments.reduce((sum, e) => sum + e.progreso, 0) /
            enrollments.length
        )
      : 0;

  const isStudent =
    perfil?.rol === "ESTUDIANTE" ||
    perfil?.rol === "GRADUADO_FWD" ||
    !perfil?.rol;
  const isVip = perfil?.rol === "GRADUADO_FWD";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis cursos</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Hola, {perfil?.nombre ?? user.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{enrollments?.length ?? 0}</p>
          <p className="text-sm text-zinc-500">Cursos inscritos</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
            <Trophy className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{promedio}%</p>
          <p className="text-sm text-zinc-500">Progreso promedio</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">
            {enrollments?.filter((e) => e.progreso >= 100).length ?? 0}
          </p>
          <p className="text-sm text-zinc-500">Completados</p>
        </div>
      </div>

      {/* ── VIP BANNER ─────────────────────────────────────────────── */}
      {isStudent && (
        <div className="relative overflow-hidden rounded-2xl">
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.25),transparent_60%)]" />
          {/* Decorative */}
          <div className="absolute right-4 top-2 opacity-10 pointer-events-none">
            <Sparkles className="h-40 w-40 text-yellow-300" />
          </div>
          <div className="absolute right-28 bottom-0 opacity-10 pointer-events-none">
            <Star className="h-20 w-20 text-yellow-200" />
          </div>

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left */}
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 border border-yellow-400/30 px-3 py-1">
                  <Crown className="h-3.5 w-3.5 text-yellow-300" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-yellow-300">
                    {isVip ? "Miembro VIP Activo" : "Membresía VIP U-Forward"}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {isVip
                    ? "¡Bienvenido, Graduado FWD!"
                    : "Lleva tu aprendizaje al siguiente nivel"}
                </h2>

                <p className="text-sm text-yellow-100/80 leading-relaxed">
                  {isVip
                    ? "Tienes acceso completo a todos los beneficios exclusivos de la membresía VIP de U-Forward."
                    : "Con la membresía VIP obtienes acceso prioritario a cursos, tutorías personalizadas, certificados verificados y comunidad exclusiva."}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { icon: Zap, label: "Acceso Anticipado" },
                    { icon: ShieldCheck, label: "Certificados Verificados" },
                    { icon: Star, label: "Tutoría Personalizada" },
                    { icon: Crown, label: "Comunidad Exclusiva" },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-[11px] font-semibold text-yellow-100"
                    >
                      <Icon className="h-3 w-3 text-yellow-300" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: CTA or badge */}
              <div className="shrink-0">
                {isVip ? (
                  <div className="flex flex-col items-center gap-2 bg-white/10 border border-white/20 rounded-2xl px-8 py-6 text-center">
                    <Crown className="h-10 w-10 text-yellow-300" />
                    <p className="text-white font-extrabold text-2xl leading-none">VIP</p>
                    <p className="text-yellow-200/70 text-xs font-medium">Graduado FWD</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Link
                      href="mailto:info@u-forward.com?subject=Solicitud%20Membresia%20VIP"
                      className="group inline-flex items-center gap-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-extrabold text-sm px-6 py-3 transition-all shadow-lg shadow-yellow-900/40 hover:shadow-yellow-700/50 hover:-translate-y-0.5"
                    >
                      <Crown className="h-4 w-4" />
                      Obtener VIP
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <p className="text-[11px] text-yellow-300/60 text-center">
                      Contacta a tu asesor o escríbenos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────── */}

      {/* Instructor / Admin quick links */}
      {(perfil?.rol === "INSTRUCTOR" || perfil?.rol === "ADMIN") && (
        <div className="flex gap-3">
          <Link href="/dashboard/instructor">
            <Button variant="secondary">
              <LayoutDashboard className="h-4 w-4" />
              Panel de instructor
            </Button>
          </Link>
          {perfil?.rol === "ADMIN" && (
            <Link href="/dashboard/admin">
              <Button variant="outline">Panel de administracion</Button>
            </Link>
          )}
        </div>
      )}

      {/* Enrolled courses list */}
      <section>
        {enrollments && enrollments.length > 0 ? (
          <div className="grid gap-3">
            {enrollments.map((enrollment) => {
              const course = enrolledCourses?.find(
                (c) => c.id === enrollment.courseId
              );
              return (
                <Link
                  key={enrollment.id}
                  href={`/courses/${enrollment.courseId}`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {course?.titulo ?? "Curso"}
                      </h3>
                      {enrollment.progreso >= 100 && (
                        <Badge variant="success">Completado</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all"
                          style={{ width: `${enrollment.progreso}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm tabular-nums text-zinc-500">
                        {enrollment.progreso}%
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-primary-500 dark:text-zinc-600" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="mb-4 text-zinc-500 dark:text-zinc-400">
              No estas inscrito en ningun curso aun.
            </p>
            <Link href="/">
              <Button variant="secondary">
                Explorar cursos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
