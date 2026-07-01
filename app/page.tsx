import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui";
import { ArrowRight, BookOpen, Search, GraduationCap, Briefcase, Star, LayoutDashboard, LogOut, Compass, Terminal, Users } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500/30 dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 border-b border-zinc-900 bg-radial-at-t from-zinc-950 via-black to-black">
        {/* Background Grid Pattern & Glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,_rgba(168,85,247,0.15),_transparent_65%)]" />
        <div className="pointer-events-none absolute top-10 left-1/4 -z-10 h-72 w-72 rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 right-1/4 -z-10 h-72 w-72 rounded-full bg-cyan-600/10 blur-[120px]" />

        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Left Side: Large U-Forward Logo Icon */}
          <div className="relative shrink-0 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-[40px] opacity-20" />
            <LogoIcon className="h-44 w-44 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)] relative z-10" />
          </div>

          {/* Middle: Elegant Vertical Separator */}
          <div className="hidden md:block h-40 w-[1px] bg-gradient-to-b from-purple-500/10 via-zinc-800 to-purple-500/10 self-center" />

          {/* Right Side: Title & Slogan */}
          <div className="text-center md:text-left space-y-4 max-w-md">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white font-sans">
              U-
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                FORWARD
              </span>
              <span className="block text-xl font-bold text-zinc-500 tracking-[0.25em] mt-1.5 font-mono">
                ACADEMY
              </span>
            </h1>
            <p className="text-xs font-bold tracking-[0.25em] text-zinc-400 font-mono">
              <span className="text-purple-400">APRENDE</span> &bull; <span className="text-pink-400">CONSTRUYE</span> &bull; <span className="text-cyan-400">AVANZA</span>
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              ¿Qué eres en U-Forward? Descubre tu potencial.
            </p>
          </div>
        </div>
      </section>

      {/* Tres Pilares de Valor */}
      <section className="bg-zinc-950/40 border-b border-zinc-900 py-10 px-6 relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
          {/* Pilar 1: Rutas de Aprendizaje */}
          <div className="flex items-start gap-4 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:border-purple-500/40 group-hover:bg-purple-500/15 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <Compass className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">Rutas de Especialización</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Progreso estructurado desde conceptos básicos hasta un nivel técnico profesional.
              </p>
            </div>
          </div>

          {/* Pilar 2: Enfoque Práctico */}
          <div className="flex items-start gap-4 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 text-pink-400 transition-all duration-300 group-hover:scale-110 group-hover:border-pink-500/40 group-hover:bg-pink-500/15 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]">
              <Terminal className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">Enfoque 100% Práctico</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Construye y despliega proyectos del mundo real para consolidar tu portafolio técnico.
              </p>
            </div>
          </div>

          {/* Pilar 3: Mentoría Activa */}
          <div className="flex items-start gap-4 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/15 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-mono">Soporte e Instructores</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Resuelve dudas de código directamente con instructores expertos en el área.
              </p>
            </div>
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
        <p>&copy; {new Date().getFullYear()} U-Forward. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
