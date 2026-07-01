import { createClient } from "@/lib/supabase/server";
import { Award, ShieldCheck, Download, Code, Server, Cpu, Database, Flame } from "lucide-react";
import Link from "next/link";

export default async function CertificadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: completed } = await supabase
    .from("Enrollment")
    .select("courseId, fechaCompletado, Course!inner(id, titulo, categoryId, instructorId, User!inner(nombre))")
    .eq("userId", user!.id)
    .eq("completado", true);

  const { data: credentials } = await supabase
    .from("FwdCredential")
    .select("estado, fechaSolicitud")
    .eq("userId", user!.id)
    .maybeSingle();

  // Dynamic Badge Unlocking Logic
  const completedCategories = new Set((completed ?? []).map((c: { Course: { categoryId: string } }) => c.Course.categoryId));

  const badges = [
    {
      id: "explorer",
      label: "Código U-Forward+",
      desc: "Completaste tu primer curso técnico",
      icon: Flame,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20",
      unlocked: (completed ?? []).length > 0
    },
    {
      id: "frontend",
      label: "Frontend Builder",
      desc: "Curso de UI y frontend completado",
      icon: Code,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20",
      unlocked: completedCategories.has("cat-frontend")
    },
    {
      id: "backend",
      label: "Backend Engineer",
      desc: "Curso de lógica de servidores completado",
      icon: Server,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
      unlocked: completedCategories.has("cat-backend")
    },
    {
      id: "devops",
      label: "DevOps Pilot",
      desc: "Curso de automatización completado",
      icon: Cpu,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20",
      unlocked: completedCategories.has("cat-devops")
    },
    {
      id: "data",
      label: "Data Science Expert",
      desc: "Curso de análisis de datos completado",
      icon: Database,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20",
      unlocked: completedCategories.has("cat-data")
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Logros y Certificados</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Tus credenciales académicas verificadas e insignias profesionales ganadas.
        </p>
      </div>

      {credentials && (
        <div className="rounded-2xl border border-primary-100 bg-primary-50/10 p-5 dark:border-primary-950/20 dark:bg-primary-950/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm shadow-primary-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 dark:text-zinc-50">Credencial U-Forward</h2>
              <p className="text-xs text-zinc-500">
                Estado: <span className="font-semibold text-primary-600 dark:text-primary-400 uppercase">{credentials.estado}</span> &middot;{" "}
                {new Date(credentials.fechaSolicitud).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Insignias */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Insignias de Habilidad</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 flex gap-3 items-center transition-all ${
                b.unlocked
                  ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm"
                  : "border-zinc-100 bg-zinc-50/50 opacity-40 dark:border-zinc-900 dark:bg-zinc-950"
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${b.unlocked ? b.color : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"}`}>
                <b.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-zinc-900 dark:text-zinc-50">{b.label}</p>
                <p className="text-[10px] text-zinc-500 truncate">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificados */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Cursos Completados ({completed?.length ?? 0})
        </h3>

        {completed && completed.length > 0 ? (
          <div className="grid gap-4">
            {completed.map((c) => {
              const course = c.Course as unknown as {
                id: string;
                titulo: string;
                instructorId: string;
                User: { nombre: string };
              };
              return (
                <div
                  key={c.courseId}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50 truncate">{course.titulo}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {course.User?.nombre}
                      {c.fechaCompletado
                        ? ` | Completado el ${new Date(c.fechaCompletado).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <Link
                    href={`/certificado/${c.courseId}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 hover:bg-primary-100 dark:bg-primary-950/40 dark:text-primary-400"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Certificado
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
            <Award className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Aún no has completado ningún curso. ¡Los certificados aparecerán aquí al final de tus lecciones!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
