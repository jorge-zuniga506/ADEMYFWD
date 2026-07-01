import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui";
import { ArrowRight, BookOpen, Search, GraduationCap, Briefcase, Star, LayoutDashboard, LogOut } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;

  const { data: categories } = await supabase
    .from("Category")
    .select("id, nombre");

  let query = supabase
    .from("Course")
    .select("id, titulo, descripcion, precio, esExclusivoFwd");

  if (params.q) {
    query = query.ilike("titulo", `%${params.q}%`);
  }
  if (params.categoria) {
    const cat = categories?.find((c) => c.nombre === params.categoria);
    if (cat) query = query.eq("categoryId", cat.id);
  }

  const { data: courses } = await query;

  const { count: totalCursos } = await supabase
    .from("Course")
    .select("*", { count: "exact", head: true });

  const { count: totalEstudiantes } = await supabase
    .from("Enrollment")
    .select("*", { count: "exact", head: true });

  const { count: totalInstructores } = await supabase
    .from("User")
    .select("*", { count: "exact", head: true })
    .in("rol", ["INSTRUCTOR", "ADMIN"]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500/30 dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 border-b border-zinc-900 bg-radial-at-t from-zinc-950 via-black to-black">
        {/* Background Grid Pattern & Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,_rgba(168,85,247,0.15),_transparent_65%)]" />
        <div className="pointer-events-none absolute top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 right-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-600/10 blur-[120px]" />

        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Left Side: Large Udemy FWD Costa Rica Logo Icon */}
          <div className="relative shrink-0 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-[40px] opacity-20" />
            <LogoIcon className="h-44 w-44 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] relative z-10" />
          </div>

          {/* Middle: Elegant Vertical Separator */}
          <div className="hidden md:block h-40 w-[1px] bg-gradient-to-b from-purple-500/10 via-zinc-800 to-purple-500/10 self-center" />

          {/* Right Side: Title & Slogan */}
          <div className="text-center md:text-left space-y-4 max-w-md">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-sans">
              UDEMY F
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                W
              </span>
              D
              <span className="block text-xl font-bold text-zinc-500 tracking-[0.25em] mt-1.5 font-mono">
                COSTA RICA
              </span>
            </h1>
            <p className="text-xs font-bold tracking-[0.25em] text-zinc-400 font-mono">
              <span className="text-purple-400">APRENDE</span> &bull; <span className="text-pink-400">CONSTRUYE</span> &bull; <span className="text-cyan-400">AVANZA</span>
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              ¿Qué eres en FWD? ¿Qué eres en UDEMY FWD?
            </p>
          </div>
        </div>
      </section>

      {/* Stats counter strip */}
      <section className="bg-zinc-950/40 border-b border-zinc-900 py-8 px-6">
        <div className="mx-auto max-w-4xl grid grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-black text-purple-400">{totalCursos ?? 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Cursos activos</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-pink-400">{totalEstudiantes ?? 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Estudiantes</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black text-cyan-400">{totalInstructores ?? 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Instructores</p>
          </div>
        </div>
      </section>

      {/* Banco de Cursos Section */}
      <section id="banco-cursos" className="mx-auto max-w-6xl px-6 py-16 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Banco de Cursos</h2>
            <p className="text-xs text-zinc-500">Busca e inscríbete en especializaciones de nivel profesional.</p>
          </div>

          {/* Glowing Search Bar */}
          <form className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-1.5 shadow-sm max-w-md w-full focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all">
            <Search className="ml-2 h-4 w-4 shrink-0 text-zinc-500" />
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Buscar React, Node, SQL..."
              className="h-8 flex-1 bg-transparent text-xs focus:outline-none text-zinc-200"
            />
            <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-xs py-1 h-8 rounded-lg font-bold">
              Buscar
            </Button>
          </form>
        </div>

        {/* Categories filters */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/#banco-cursos"
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
                href={`/?categoria=${cat.nombre}#banco-cursos`}
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

        {/* Courses Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                href="/#banco-cursos"
                className="mt-3 inline-block text-xs font-bold text-purple-400 hover:underline"
              >
                Ver todos los cursos
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Foot Footer */}
      <footer className="border-t border-zinc-900 bg-black/80 py-8 px-6 text-center text-xs text-zinc-600">
        <p>&copy; {new Date().getFullYear()} Udemy FWD Costa Rica. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
