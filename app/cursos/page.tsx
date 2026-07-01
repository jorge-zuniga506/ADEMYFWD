import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui";
import { Search, BookOpen } from "lucide-react";

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const { data: categories } = await supabase
    .from("Category")
    .select("id, nombre");

  let query = supabase
    .from("Course")
    .select("id, titulo, descripcion, precio, esExclusivoFwd, duracionHoras, categoryId, instructorId")
    .eq("estado", "PUBLICADO"); // Only show published courses

  if (params.q) {
    query = query.ilike("titulo", `%${params.q}%`);
  }
  if (params.categoria) {
    const cat = categories?.find((c) => c.nombre === params.categoria);
    if (cat) query = query.eq("categoryId", cat.id);
  }

  const { data: coursesRaw } = await query;

  // Courses from VIP+FWD verified instructors are surfaced first.
  const instructorIds = [...new Set((coursesRaw ?? []).map((c) => c.instructorId))];
  const { data: verifiedInstructors } = instructorIds.length > 0
    ? await supabase.from("User").select("id, isVerified").in("id", instructorIds)
    : { data: [] };
  const verifiedSet = new Set((verifiedInstructors ?? []).filter((u) => u.isVerified).map((u) => u.id));

  const courses = (coursesRaw ?? [])
    .map((c) => ({ ...c, instructorVerificado: verifiedSet.has(c.instructorId) }))
    .sort((a, b) => Number(b.instructorVerificado) - Number(a.instructorVerificado));

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans px-6 py-12 dark">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* Page Header */}
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Catálogo de Cursos
          </h1>
          <p className="text-sm text-zinc-400">
            Especializaciones profesionales diseñadas por mentores de U-Forward. Adquiere habilidades demandadas hoy.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4 border-t border-zinc-900">
          {/* Categories filters */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/cursos"
                className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                  !params.categoria
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                }`}
              >
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/cursos?categoria=${cat.nombre}`}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                    params.categoria === cat.nombre
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white"
                  }`}
                >
                  {cat.nombre}
                </Link>
              ))}
            </div>
          )}

          {/* Glowing Search Input */}
          <form className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1.5 shadow-sm max-w-md w-full focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all">
            <Search className="ml-2 h-4 w-4 shrink-0 text-zinc-500" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Buscar React, Node, DevOps..."
              className="h-8 flex-1 bg-transparent text-xs focus:outline-none text-zinc-200"
            />
            <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-xs py-1 h-8 rounded-lg font-bold">
              Buscar
            </Button>
          </form>
        </div>

        {/* Courses Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-6">
          {courses?.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>

        {(!courses || courses.length === 0) && (
          <div className="rounded-2xl border border-dashed border-zinc-800 py-20 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
            <p className="text-xs text-zinc-500">
              {params.q
                ? `No se encontraron resultados para la búsqueda "${params.q}".`
                : "No hay cursos publicados todavía en esta categoría."}
            </p>
            {params.q && (
              <Link
                href="/cursos"
                className="mt-3 inline-block text-xs font-bold text-purple-400 hover:underline"
              >
                Ver todos los cursos
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
