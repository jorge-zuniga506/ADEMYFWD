import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge } from "@/components/ui";
import {
  BookOpen,
  Lock,
  Play,
  User,
  Tag,
  ChevronLeft,
  Star,
  Clock,
  Award,
  ShieldCheck,
  Check,
  Globe,
  Sparkles,
  Smartphone,
  FileCode2,
} from "lucide-react";

interface SectionProps {
  id: string;
  titulo: string;
  orden: number;
}

const categoryImages: Record<string, string> = {
  "a1e0ee0c-83b3-4f51-b0e7-8be5f2f46e01": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
  "b2e0ee0c-83b3-4f51-b0e7-8be5f2f46e02": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
  "c3e0ee0c-83b3-4f51-b0e7-8be5f2f46e03": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&q=80",
  "d4e0ee0c-83b3-4f51-b0e7-8be5f2f46e04": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  "e5e0ee0c-83b3-4f51-b0e7-8be5f2f46e05": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "f6e0ee0c-83b3-4f51-b0e7-8be5f2f46e06": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
  "a7e0ee0c-83b3-4f51-b0e7-8be5f2f46e07": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "b8e0ee0c-83b3-4f51-b0e7-8be5f2f46e08": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80",
  "c9e0ee0c-83b3-4f51-b0e7-8be5f2f46e09": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
  "dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80"
};

const courseImages: Record<string, string> = {
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e13": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e17": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e16": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e14": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e18": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e19": "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e20": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e21": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e22": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e23": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e24": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e25": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e26": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e27": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e28": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e29": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e30": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e31": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e32": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e33": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e34": "https://images.unsplash.com/photo-1684126743128-44bd7ea1f0c2?auto=format&fit=crop&w=1200&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e35": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80",
};

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("Course")
    .select("id, titulo, descripcion, precio, esExclusivoFwd, instructorId, categoryId, duracionHoras")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: sections } = await supabase
    .from("Section")
    .select("id, titulo, orden")
    .eq("courseId", courseId)
    .order("orden");

  const { data: instructor } = await supabase
    .from("User")
    .select("nombre")
    .eq("id", course.instructorId)
    .single();

  const { data: category } = await supabase
    .from("Category")
    .select("nombre")
    .eq("id", course.categoryId)
    .single();

  const { data: enrollment } = user
    ? await supabase
        .from("Enrollment")
        .select("id, progreso, completado")
        .eq("userId", user.id)
        .eq("courseId", course.id)
        .single()
    : { data: null };

  const isEnrolled = !!enrollment;
  const sectionIds = sections?.map((s) => s.id) ?? [];
  const { data: allLessons } = sectionIds.length > 0
    ? await supabase
        .from("Lesson")
        .select("id, sectionId, orden")
        .in("sectionId", sectionIds)
        .order("orden")
    : { data: [] };

  const totalLessons = allLessons?.length ?? 0;
  const firstLessonId = allLessons && allLessons.length > 0 ? allLessons[0].id : "";

  // High quality Unsplash cover image
  const imageUrl = courseImages[course.id] || categoryImages[course.categoryId] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

  // Dynamic realistic rating, duration, and students count
  const rating = (4.3 + (course.titulo.length % 7) * 0.1).toFixed(1);
  const totalReviews = 45 + (course.titulo.length % 5) * 124;
  const duration = course.duracionHoras || (5 + (course.titulo.length % 15));
  const studentsEnrolled = 1240 + (course.titulo.length % 8) * 480;

  // What you will learn mockup items based on categories
  const learnItems = [
    `Dominar los conceptos avanzados y buenas prácticas profesionales del temario de ${category?.nombre || "la especialización"}.`,
    "Implementar arquitecturas robustas y escalables aplicables en proyectos reales.",
    "Aprender a depurar código y solucionar cuellos de botella de rendimiento.",
    "Desplegar aplicaciones en la nube y configurarlas de manera segura.",
    "Construir un portafolio de proyectos prácticos que demuestren tu nivel experto."
  ];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 font-sans antialiased pb-20 dark">
      
      {/* Course Hero Banner */}
      <div className="relative bg-[#13141c] border-b border-zinc-800/80 px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Hero Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/cursos"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                Catálogo
              </Link>
              <span className="text-zinc-600">/</span>
              {category && (
                <Badge variant="default" className="bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs px-2 py-0.5 rounded">
                  <Tag className="mr-1 h-3 w-3 inline text-purple-400" />
                  {category.nombre}
                </Badge>
              )}
              {course.esExclusivoFwd && (
                <Badge variant="fwd" className="bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs px-2 py-0.5 rounded">
                  U-Forward+
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {course.titulo}
            </h1>
            
            <p className="text-base text-zinc-300 max-w-3xl leading-relaxed">
              {course.descripcion}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current text-amber-400" />
                <span className="font-bold text-zinc-200 text-sm">{rating}</span>
                <span className="text-zinc-500">({totalReviews} calificaciones) • {studentsEnrolled} estudiantes</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-purple-400" />
                <span className="text-zinc-200">{duration} horas de contenido</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-purple-400" />
                <span>Español [Audio]</span>
              </div>

              {instructor && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-purple-400" />
                  <span>Creado por <strong className="text-zinc-200">{instructor.nombre}</strong></span>
                </div>
              )}
            </div>

            <p className="text-[10px] text-zinc-500">
              Última actualización: 06/2026 • Incluye mentoría U-Forward integrada
            </p>
          </div>

          {/* Right Floating Card Widget (Desktop) / Normal Section (Mobile) */}
          <div className="bg-[#1a1c24] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl lg:sticky lg:top-24">
            
            {/* Aspect Video cover with Play Overlay */}
            <div className="relative aspect-video bg-zinc-900 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={course.titulo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 group-hover:bg-purple-600/90 group-hover:scale-110 transition-all duration-300 shadow-lg cursor-pointer">
                  <Play className="h-6 w-6 text-white fill-current ml-1" />
                </div>
              </div>
              <span className="absolute bottom-3 left-3 text-[10px] bg-black/60 px-2 py-0.5 rounded font-bold text-zinc-300">
                Vista previa de la especialización
              </span>
            </div>

            {/* Price and Action Section */}
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white">
                    {course.precio === 0 ? "Gratis" : `$${course.precio.toFixed(2)}`}
                  </span>
                  {course.precio > 0 && (
                    <>
                      <span className="text-sm line-through text-zinc-500">$39.99</span>
                      <span className="text-xs bg-purple-950 text-purple-400 font-bold px-2 py-0.5 rounded border border-purple-800/40">
                        75% de descuento
                      </span>
                    </>
                  )}
                </div>
                {course.precio > 0 && (
                  <p className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> ¡Quedan 2 días a este precio especial!
                  </p>
                )}
              </div>

              {/* Action Button */}
              {isEnrolled ? (
                <div className="space-y-2">
                  <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3 text-center">
                    <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Ya estás inscrito en este curso
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">Progreso actual: {enrollment.progreso}%</p>
                  </div>
                  <Link
                    href={firstLessonId ? `/courses/${course.id}/lessons/${firstLessonId}` : "/dashboard/student"}
                    className="block text-center bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-purple-600/20"
                  >
                    Ir al Aula Virtual
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <EnrollButton courseId={course.id} precio={course.precio} />
                  <p className="text-center text-[10px] text-zinc-500">
                    Garantía de reembolso de 30 días • Acceso de por vida
                  </p>
                </div>
              )}

              {/* Course Benefits List */}
              <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                <p className="font-bold text-white uppercase tracking-wider text-[10px] text-zinc-400">
                  Esta especialización incluye:
                </p>
                
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Acceso ilimitado de por vida</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Smartphone className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Acceso en dispositivos móviles y TV</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <FileCode2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{totalLessons} recursos y lecciones interactivas</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Award className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-purple-300">Certificado de Finalización U-Forward+</span>
                </div>
              </div>

              {/* Preapplied Coupons */}
              <div className="pt-3 border-t border-zinc-800 text-xs space-y-2">
                <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                  <div>
                    <p className="font-bold text-white text-[10px]">Cupón Aplicado</p>
                    <p className="text-zinc-500 font-mono text-[9px]">MT260629G1</p>
                  </div>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[10px]">
                    ¡Aplicado!
                  </Badge>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-6xl px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Side Details */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* What You Will Learn Card */}
          <div className="bg-[#13141c] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Lo que aprenderás en esta especialización
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {learnItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                  <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Contents Structure */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-white">Contenido del curso</h2>
              <span className="text-xs text-zinc-500 font-semibold">
                {sections?.length ?? 0} secciones • {totalLessons} lecciones • {duration}h duración total
              </span>
            </div>

            <div className="space-y-3">
              {sections?.map((section) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  courseId={course.id}
                  isEnrolled={isEnrolled}
                />
              ))}

              {(!sections || sections.length === 0) && (
                <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                  <p className="text-sm text-zinc-500">No hay secciones ni lecciones disponibles aún.</p>
                  <p className="text-xs text-zinc-600 mt-1">El instructor está subiendo el contenido de estudio.</p>
                </div>
              )}
            </div>
          </div>

          {/* Certifications and Endorsements Banner */}
          <div className="bg-gradient-to-r from-purple-950/20 via-zinc-900/40 to-cyan-950/20 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-base font-bold text-white flex items-center justify-center md:justify-start gap-2">
                <Award className="h-5 w-5 text-purple-400" />
                Certificación Profesional Incluida
              </h3>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                Al completar el 100% de las lecciones prácticas y los desafíos, obtendrás un certificado digital imprimible con firma del instructor y código de verificación único de U-Forward.
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center h-20 w-20 rounded-full border border-purple-500/20 bg-purple-950/20 shadow-inner">
              <Award className="h-10 w-10 text-purple-400" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

async function SectionBlock({
  section,
  courseId,
  isEnrolled,
}: {
  section: SectionProps;
  courseId: string;
  isEnrolled: boolean;
}) {
  const supabase = await createClient();
  const { data: lessons } = await supabase
    .from("Lesson")
    .select("id, titulo, orden, esGratis, videoUrl")
    .eq("sectionId", section.id)
    .order("orden");

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#13141c]">
      
      {/* Accordion Section Header */}
      <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-900/40 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4.5 w-4.5 text-purple-400 shrink-0" />
          <span className="font-bold text-sm text-zinc-200">{section.titulo}</span>
        </div>
        <span className="text-xs text-zinc-500 font-semibold">
          {lessons?.length ?? 0} lección{lessons?.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Lesson List */}
      <div className="divide-y divide-zinc-900 bg-[#161720]">
        {lessons?.map((lesson) => {
          const canView = isEnrolled || lesson.esGratis;
          return (
            <Link
              key={lesson.id}
              href={canView ? `/courses/${courseId}/lessons/${lesson.id}` : "#"}
              className={`flex items-center justify-between px-5 py-3.5 text-xs transition-all duration-200 ${
                canView
                  ? "hover:bg-zinc-900/60 text-zinc-300 hover:text-white"
                  : "cursor-default opacity-40 text-zinc-500"
              }`}
            >
              <div className="flex items-center gap-3">
                {canView ? (
                  <Play className="h-3.5 w-3.5 text-purple-400 fill-current shrink-0" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
                )}
                <span className="font-medium">{lesson.titulo}</span>
              </div>
              {lesson.esGratis && !isEnrolled && (
                <Badge variant="success" className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-[9px] px-1.5 py-0.5">
                  Vista Previa
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

    </div>
  );
}

function EnrollButton({ courseId, precio }: { courseId: string; precio: number }) {
  if (precio > 0) {
    return (
      <Link
        href={`/courses/${courseId}/checkout`}
        className="block text-center w-full bg-purple-600 hover:bg-purple-500 hover:scale-[1.01] transition-all duration-300 font-black text-sm py-4 rounded-xl text-white shadow-lg shadow-purple-600/10"
      >
        Comprar ahora
      </Link>
    );
  }

  return (
    <form action={`/api/enroll/${courseId}`} method="post" className="w-full">
      <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-500 hover:scale-[1.01] transition-all duration-300 font-black text-sm py-4 rounded-xl text-white shadow-lg shadow-purple-600/10">
        Inscribirse ahora (Gratis)
      </Button>
    </form>
  );
}
