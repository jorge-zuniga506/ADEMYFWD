import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  updateCourse, 
  createSection, 
  createLesson, 
  deleteCourse, 
  deleteSection, 
  deleteLesson 
} from "@/lib/actions/courses";
import { Trash2 } from "lucide-react";
import DeleteForm from "./DeleteForm";
import AiDescriptionButton from "@/components/ai/AiDescriptionButton";
import AiSectionButton from "@/components/ai/AiSectionButton";
import AiQuizGenerator from "@/components/ai/AiQuizGenerator";
import AiModerationButton from "@/components/ai/AiModerationButton";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: course } = await supabase
    .from("Course")
    .select("id, titulo, descripcion, precio, esExclusivoFwd, categoryId, instructorId, videoUrl, duracionHoras, estado")
    .eq("id", courseId)
    .single();
  if (!course || course.instructorId !== user.id) notFound();

  const { data: categories } = await supabase.from("Category").select("id, nombre");
  const categoryName = categories?.find(c => c.id === course.categoryId)?.nombre ?? "General";
  const { data: sections } = await supabase
    .from("Section")
    .select("id, titulo, orden")
    .eq("courseId", courseId)
    .order("orden");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Editar curso</h1>
        <AiQuizGenerator 
          courseId={courseId} 
          tituloCurso={course.titulo} 
          sections={sections ?? []} 
        />
      </div>

      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold">Informacion del curso</h2>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              course.estado === 'PUBLICADO' 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : course.estado === 'EN_REVISION' 
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' 
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
            }`}>
              Estado: {course.estado}
            </span>
            <AiModerationButton courseId={courseId} estadoActual={course.estado ?? "BORRADOR"} />
          </div>
        </div>
        <form action={updateCourse.bind(null, courseId)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Titulo</label>
            <input
              name="titulo"
              defaultValue={course.titulo}
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-zinc-700">Descripcion</label>
              <AiDescriptionButton titulo={course.titulo} categoryName={categoryName} />
            </div>
            <textarea
              name="descripcion"
              defaultValue={course.descripcion}
              required
              rows={3}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Precio ($)</label>
            <input
              name="precio"
              type="number"
              step="0.01"
              min="0"
              defaultValue={course.precio}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Categoria</label>
            <select
              name="categoryId"
              defaultValue={course.categoryId}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Tráiler de venta (Link YouTube)</label>
            <input
              name="videoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={course.videoUrl ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700">Duración Total (Horas)</label>
            <input
              name="duracionHoras"
              type="number"
              step="0.1"
              min="0"
              placeholder="Ej. 5.5"
              defaultValue={course.duracionHoras ?? ""}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
            {course.duracionHoras !== null && (course.duracionHoras < 2 || course.duracionHoras > 20) && (
              <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-500">
                ⚠️ Regla de negocio: El curso debe durar entre 2 y 20 horas para que sea aprobado por administración.
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="esExclusivoFwd" defaultChecked={course.esExclusivoFwd} />
            <span>Curso exclusivo U-Forward+</span>
          </label>

          <button
            type="submit"
            className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Guardar cambios
          </button>
        </form>

        <DeleteForm
          action={deleteCourse.bind(null, courseId)}
          confirmMessage="¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer."
          className="mt-6 border-t border-red-100 bg-red-50/30 p-4 rounded-xl dark:border-red-950/30 dark:bg-red-950/10 flex flex-col gap-2"
        >
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Zona de Peligro</h3>
          <p className="text-xs text-red-600 dark:text-red-500">
            Una vez que elimines este curso, no podrás recuperar la información, lecciones ni estudiantes inscritos.
          </p>
          <button
            type="submit"
            className="self-start rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
          >
            Eliminar curso permanentemente
          </button>
        </DeleteForm>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">Secciones</h2>

        {sections?.map((section) => (
          <SectionEditor key={section.id} section={section} courseId={courseId} />
        ))}

        <details className="mt-4 rounded-lg border border-zinc-200">
          <summary className="cursor-pointer px-4 py-2 text-sm font-medium hover:bg-zinc-50">
            Agregar seccion
          </summary>
          <form
            action={createSection.bind(null, courseId)}
            className="flex flex-col gap-3 border-t border-zinc-100 p-4"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-zinc-500">¿Sin ideas?</span>
              <AiSectionButton tituloCurso={course.titulo} />
            </div>
            <input
              name="titulo"
              placeholder="Titulo de la seccion"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
            <input
              name="orden"
              type="number"
              placeholder="Orden"
              defaultValue={sections?.length ?? 0 + 1}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
            <button
              type="submit"
              className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Agregar
            </button>
          </form>
        </details>
      </section>
    </main>
  );
}

async function SectionEditor({
  section,
  courseId,
}: {
  section: { id: string; titulo: string; orden: number };
  courseId: string;
}) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("Lesson")
    .select("id, titulo, orden, esGratis, videoUrl, recursoUrl, recursoNombre")
    .eq("sectionId", section.id)
    .order("orden");

  return (
    <div className="mb-4 rounded-lg border border-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2">
        <span className="text-sm font-medium">
          {section.orden}. {section.titulo}
        </span>
        <DeleteForm
          action={deleteSection.bind(null, section.id, courseId)}
          confirmMessage="¿Estás seguro de que quieres eliminar esta sección?"
        >
          <button type="submit" className="text-zinc-400 hover:text-red-500 transition p-1">
            <Trash2 className="h-4 w-4" />
          </button>
        </DeleteForm>
      </div>

      {lessons && lessons.length > 0 ? (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border-b border-zinc-100 last:border-b-0">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{lesson.titulo}</span>
                  <span className="text-xs text-zinc-400">
                    ({lesson.esGratis ? "Gratis" : "Premium"})
                  </span>
                </div>
                {lesson.recursoUrl && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Recurso: <a href={lesson.recursoUrl} target="_blank" rel="noreferrer" className="underline">{lesson.recursoNombre || "Descargar recurso"}</a>
                  </span>
                )}
              </div>
              <DeleteForm
                action={deleteLesson.bind(null, lesson.id, section.id, courseId)}
                confirmMessage="¿Estás seguro de que quieres eliminar esta lección?"
              >
                <button type="submit" className="text-zinc-400 hover:text-red-500 transition p-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </DeleteForm>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3 text-xs text-zinc-400 border-b border-zinc-100 last:border-b-0">
          No hay lecciones en esta sección.
        </div>
      )}

      <details className="border-t border-zinc-100">
        <summary className="cursor-pointer px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900">
          Agregar leccion
        </summary>
        <form
          action={createLesson.bind(null, section.id, courseId)}
          className="flex flex-col gap-3 border-t border-zinc-100 p-4"
        >
          <input
            name="titulo"
            placeholder="Titulo de la leccion"
            required
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
          <input
            name="videoUrl"
            placeholder="URL del video"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
          <input
            name="orden"
            type="number"
            placeholder="Orden"
            defaultValue={(lessons?.length ?? 0) + 1}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
          <input
            name="recursoNombre"
            placeholder="Nombre del recurso (Ej. Código fuente, Guía PDF)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
          <input
            name="recursoUrl"
            placeholder="URL del recurso descargable (Drive, Github, Dropbox)"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="esGratis" />
            <span>Leccion gratuita</span>
          </label>
          <button
            type="submit"
            className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Agregar
          </button>
        </form>
      </details>
    </div>
  );
}
