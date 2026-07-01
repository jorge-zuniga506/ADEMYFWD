import { createClient } from "@/lib/supabase/server";
import { publishCourse, returnCourse } from "@/lib/actions/admin";
import { Badge, Button } from "@/components/ui";
import { BookOpen, Check, RotateCcw } from "lucide-react";

const statusLabels: Record<string, { label: string; variant: "default" | "warning" | "success" }> = {
  BORRADOR: { label: "Borrador", variant: "default" },
  EN_REVISION: { label: "En Revision", variant: "warning" },
  PUBLICADO: { label: "Publicado", variant: "success" },
};

export default async function AuditoriaCursosPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("Course")
    .select("id, titulo, descripcion, precio, estado, duracionHoras, videoUrl, instructorId, User!inner(nombre)")
    .order("titulo", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Auditoria de Cursos
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Control de calidad &mdash; Revisa y publica cursos
        </p>
      </div>

      {courses && courses.length > 0 ? (
        <div className="grid gap-4">
          {courses.map((course) => {
            const instructor = course.User as unknown as { nombre: string };
            const status = statusLabels[course.estado ?? "BORRADOR"] ?? statusLabels.BORRADOR;

            return (
              <div
                key={course.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{course.titulo}</h3>
                    <p className="text-sm text-zinc-500">
                      {instructor.nombre} &middot; ${course.precio.toFixed(2)}
                      {course.duracionHoras ? ` &middot; ${course.duracionHoras}h` : ""}
                    </p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {course.descripcion}
                </p>

                {course.estado === "EN_REVISION" && (
                  <div className="flex gap-2">
                    <form action={publishCourse.bind(null, course.id)}>
                      <Button type="submit" size="sm">
                        <Check className="h-4 w-4" />
                        Publicar Curso
                      </Button>
                    </form>

                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        const notas = formData.get("notas") as string;
                        await returnCourse(course.id, notas);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        name="notas"
                        placeholder="Notas de correccion..."
                        className="h-8 rounded-lg border border-zinc-300 px-2 text-xs focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <Button type="submit" variant="outline" size="sm">
                        <RotateCcw className="h-4 w-4" />
                        Devolver
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No hay cursos registrados.
          </p>
        </div>
      )}
    </div>
  );
}
