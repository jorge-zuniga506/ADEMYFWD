import { createClient } from "@/lib/supabase/server";
import { createQuestion, deleteQuestion } from "@/lib/actions/qa";
import { MessageSquare, Plus, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";

export default async function QandaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: questions } = await supabase
    .from("Question")
    .select("id, titulo, contenido, courseId, fechaCreacion, resuelta, User!inner(nombre)")
    .eq("userId", user!.id)
    .order("fechaCreacion", { ascending: false });

  const { data: courses } = await supabase
    .from("Enrollment")
    .select("courseId, Course!inner(id, titulo)")
    .eq("userId", user!.id);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Q&A</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Preguntas y respuestas de tus cursos
          </p>
        </div>
      </div>

      <details className="mb-8 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-medium text-primary-600">
          <Plus className="h-4 w-4" />
          Nueva pregunta
        </summary>
        <form action={createQuestion} className="border-t border-zinc-200 p-5 dark:border-zinc-800">
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Curso
              </label>
              <select
                name="courseId"
                required
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
              >
                <option value="">Selecciona un curso</option>
                {courses?.map((e) => {
                  const c = e.Course as unknown as { id: string; titulo: string };
                  return (
                    <option key={c.id} value={c.id}>
                      {c.titulo}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Titulo
              </label>
              <input
                name="titulo"
                required
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Contenido
              </label>
              <textarea
                name="contenido"
                required
                rows={4}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
              />
            </div>
            <div>
              <Button type="submit" size="sm">Publicar pregunta</Button>
            </div>
          </div>
        </form>
      </details>

      {questions && questions.length > 0 ? (
        <div className="grid gap-3">
          {questions.map((q) => {
            const autor = q.User as unknown as { nombre: string };
            return (
              <div
                key={q.id}
                className="relative flex justify-between items-start rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-primary-300 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Link
                  href={`/dashboard/student/qanda/${q.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{q.titulo}</h3>
                    {q.resuelta && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                        Resuelta
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {q.contenido}
                  </p>
                  <p className="mt-2 text-xs text-zinc-400">
                    {autor.nombre} &middot; {new Date(q.fechaCreacion).toLocaleDateString()}
                  </p>
                </Link>

                <form 
                  action={deleteQuestion.bind(null, q.id)} 
                  onSubmit={(e) => {
                    if (!confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
                      e.preventDefault();
                    }
                  }}
                  className="ml-4 shrink-0"
                >
                  <button type="submit" className="text-zinc-400 hover:text-red-500 transition p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No has hecho ninguna pregunta aun.
          </p>
        </div>
      )}
    </div>
  );
}
