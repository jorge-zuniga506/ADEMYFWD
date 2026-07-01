import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge } from "@/components/ui";
import {
  LayoutDashboard,
  BookOpen,
  ArrowRight,
  Trophy,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch profile — select stable columns only to avoid errors if migration hasn't run yet
  const { data: perfil } = await supabase
    .from("User")
    .select("nombre, rol")
    .eq("id", user!.id)
    .single();

  // Only redirect to onboarding if user has absolutely no profile row
  if (!perfil) redirect("/auth/onboarding");

  // Separately check onboardingDone (column may not exist yet in DB)
  // We wrap this in a try-style pattern using the error field
  const { data: onboardingRow } = await supabase
    .from("User")
    .select("onboardingDone")
    .eq("id", user!.id)
    .single();

  // If column exists and explicitly false → onboarding needed
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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mis cursos</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Hola, {perfil?.nombre ?? user.email}
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
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

      {(perfil?.rol === "INSTRUCTOR" || perfil?.rol === "ADMIN") && (
        <div className="mb-8 flex gap-3">
          <Link href="/dashboard/instructor">
            <Button variant="secondary">
              <LayoutDashboard className="h-4 w-4" />
              Panel de instructor
            </Button>
          </Link>
          {perfil?.rol === "ADMIN" && (
            <Link href="/dashboard/admin">
              <Button variant="outline">
                Panel de administracion
              </Button>
            </Link>
          )}
        </div>
      )}

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
