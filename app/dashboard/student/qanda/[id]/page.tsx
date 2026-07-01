import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createRespuesta, marcarResuelta } from "@/lib/actions/qa";
import { Button } from "@/components/ui";
import { Check, MessageSquare, User } from "lucide-react";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: question } = await supabase
    .from("Question")
    .select("id, titulo, contenido, fechaCreacion, resuelta, userId, courseId, User!inner(nombre)")
    .eq("id", id)
    .single();

  if (!question) notFound();

  const { data: course } = await supabase
    .from("Course")
    .select("instructorId")
    .eq("id", question.courseId)
    .single();

  const { data: respuestas } = await supabase
    .from("Respuesta")
    .select("id, contenido, fechaCreacion, User!inner(nombre)")
    .eq("questionId", id)
    .order("fechaCreacion", { ascending: true });

  const autor = question.User as unknown as { nombre: string };
  const esAutor = question.userId === user?.id || course?.instructorId === user?.id;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{question.titulo}</h1>
              {question.resuelta && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                  Resuelta
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {autor.nombre} &middot; {new Date(question.fechaCreacion).toLocaleDateString()}
            </p>
          </div>
          {esAutor && !question.resuelta && (
            <form action={marcarResuelta.bind(null, question.id)}>
              <Button type="submit" variant="outline" size="sm">
                <Check className="h-4 w-4" />
                Marcar resuelta
              </Button>
            </form>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {question.contenido}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">
          Respuestas ({respuestas?.length ?? 0})
        </h2>

        {respuestas && respuestas.length > 0 ? (
          <div className="grid gap-4">
            {respuestas.map((r) => {
              const respondio = r.User as unknown as { nombre: string };
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
                      {respondio.nombre.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{respondio.nombre}</span>
                    <span className="text-xs text-zinc-400">
                      {new Date(r.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {r.contenido}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center dark:border-zinc-700">
            <MessageSquare className="mx-auto mb-2 h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">
              Aun no hay respuestas. Se el primero en responder.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 font-medium">Responder</h3>
        <form action={createRespuesta} className="grid gap-4">
          <input type="hidden" name="questionId" value={question.id} />
          <textarea
            name="contenido"
            required
            rows={3}
            placeholder="Escribe tu respuesta..."
            className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
          />
          <div>
            <Button type="submit" size="sm">Enviar respuesta</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
