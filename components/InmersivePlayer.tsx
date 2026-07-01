"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Play, 
  Menu, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  MessageSquare, 
  Star, 
  Video, 
  CheckSquare, 
  Square,
  Clock,
  Send,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { updateLastLesson, postReview } from "@/lib/actions/student";
import { createQuestion } from "@/lib/actions/qa";
import { Button } from "./ui";
import Link from "next/link";

interface Lesson {
  id: string;
  titulo: string;
  orden: number;
  esGratis: boolean;
  sectionId: string;
  videoUrl: string | null;
  recursoUrl: string | null;
  recursoNombre: string | null;
}

interface Section {
  id: string;
  titulo: string;
  orden: number;
}

export default function InmersivePlayer({
  course,
  currentLesson,
  sections,
  lessons,
  enrollment,
  userReview,
  liveMeetLink,
  liveMeetFecha,
  questions,
  completedLessonIds,
  userId
}: {
  course: { id: string; titulo: string };
  currentLesson: Lesson;
  sections: Section[];
  lessons: Lesson[];
  enrollment: { id: string; progreso: number; completado: boolean; lastLessonId: string | null } | null;
  userReview: { id: string; estrellas: number; comentario: string | null } | null;
  liveMeetLink: string | null;
  liveMeetFecha: string | null;
  questions: any[];
  completedLessonIds: string[];
  userId: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"recursos" | "qa" | "review" | "mentor">("recursos");
  const [completedIds, setCompletedIds] = useState<string[]>(completedLessonIds);
  const [videoTime, setVideoTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [reviewMsg, setReviewMsg] = useState("");
  const [qaMsg, setQaMsg] = useState("");

  const currentSection = sections.find(s => s.id === currentLesson.sectionId);

  // Auto-log lesson load as last studied lesson on mount
  useEffect(() => {
    const logLessonLoad = async () => {
      if (enrollment && enrollment.lastLessonId !== currentLesson.id) {
        // Calculate progress based on existing completed lessons
        const total = lessons.length;
        const currentProgress = total > 0 ? Math.round((completedIds.length / total) * 100) : 0;
        await updateLastLesson(course.id, currentLesson.id, currentProgress);
      }
    };
    logLessonLoad();
  }, [currentLesson.id]);

  // Track video current play time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoTime(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleLessonCheckboxToggle = async (lessonId: string) => {
    let newCompleted: string[];
    if (completedIds.includes(lessonId)) {
      newCompleted = completedIds.filter(id => id !== lessonId);
    } else {
      newCompleted = [...completedIds, lessonId];
    }
    setCompletedIds(newCompleted);

    // Persist completion state and calculate progress percentage
    if (enrollment) {
      const total = lessons.length;
      const progress = total > 0 ? Math.round((newCompleted.length / total) * 100) : 0;
      await updateLastLesson(course.id, currentLesson.id, progress);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const estrellas = parseInt(formData.get("estrellas") as string);
    const comentario = formData.get("comentario") as string;
    try {
      await postReview(course.id, estrellas, comentario);
      setReviewMsg("¡Tu reseña se ha guardado con éxito!");
      setTimeout(() => setReviewMsg(""), 5000);
    } catch (err: any) {
      setReviewMsg(`Error: ${err.message}`);
    }
  };

  const handleQaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await createQuestion(formData);
      setQaMsg("¡Pregunta enviada al foro Q&A con éxito!");
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setQaMsg("");
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setQaMsg(`Error: ${err.message}`);
    }
  };

  // Nav index logic
  const courseLessons = lessons;
  const currentIdx = courseLessons.findIndex(l => l.id === currentLesson.id);
  const prevLesson = currentIdx > 0 ? courseLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < courseLessons.length - 1 ? courseLessons[currentIdx + 1] : null;

  // Calculate current progress
  const total = lessons.length;
  const computedProgress = total > 0 ? Math.round((completedIds.length / total) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-zinc-950 text-zinc-50 font-sans md:flex-row overflow-hidden">
      {/* Video Content & Tabs (Left) */}
      <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/student`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a Mis Cursos
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-850"
          >
            <Menu className="h-4 w-4" />
            {sidebarOpen ? "Ocultar temario" : "Mostrar temario"}
          </button>
        </div>

        {/* Video Frame */}
        <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-xl border border-zinc-900">
          {currentLesson.videoUrl ? (
            <video
              ref={videoRef}
              className="aspect-video w-full focus:outline-none"
              controls
              onTimeUpdate={handleTimeUpdate}
              src={currentLesson.videoUrl}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center text-zinc-500">
              <div className="text-center space-y-2">
                <Play className="mx-auto h-12 w-12 text-zinc-600 animate-pulse" />
                <p className="text-sm font-medium">Clase práctica o material teórico</p>
                <p className="text-xs text-zinc-600">Video no provisto para esta lección</p>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Titles and Navigation */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold">{currentLesson.titulo}</h1>
            <p className="text-xs text-zinc-400">
              {course.titulo} &middot; {currentSection?.titulo}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {prevLesson && (
              <Link
                href={`/courses/${course.id}/lessons/${prevLesson.id}`}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-850 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Link>
            )}
            {nextLesson && (
              <Link
                href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                className="inline-flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-850 px-3 py-2 text-xs font-semibold text-zinc-300"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            )}
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("recursos")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "recursos"
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Recursos
          </button>
          <button
            onClick={() => setActiveTab("qa")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "qa"
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Foro Q&A
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "review"
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Star className="h-3.5 w-3.5" />
            Valorar
          </button>
          <button
            onClick={() => setActiveTab("mentor")}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === "mentor"
                ? "border-primary-500 text-primary-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            Sesión en Vivo
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="flex-1 rounded-xl bg-zinc-900/40 p-5 border border-zinc-900 min-h-[160px]">
          {/* TAB 1: Recursos */}
          {activeTab === "recursos" && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-zinc-200">Archivos y Enlaces de Interés</h4>
              {currentLesson.recursoUrl ? (
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{currentLesson.recursoNombre || "Recurso descargable"}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-md">{currentLesson.recursoUrl}</p>
                  </div>
                  <a
                    href={currentLesson.recursoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 px-3 py-1.5 text-xs font-bold text-white transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </a>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  Esta lección no incluye ningún archivo adjunto o código fuente descargable.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: Foro Q&A */}
          {activeTab === "qa" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-bold text-zinc-200">Preguntas de este Curso</h4>
              </div>

              {/* Formulario */}
              <form onSubmit={handleQaSubmit} className="space-y-3 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                <input type="hidden" name="courseId" value={course.id} />
                <input type="hidden" name="userId" value={userId} />
                
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">Título de la duda</label>
                    <input
                      name="titulo"
                      required
                      placeholder="Ej: Error al conectar con Prisma"
                      className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-zinc-400">Minuto en el video (opcional)</label>
                    <div className="flex items-center gap-2">
                      <input
                        name="videoSegundo"
                        type="number"
                        placeholder="Ej. 120"
                        value={videoTime}
                        onChange={(e) => setVideoTime(parseInt(e.target.value) || 0)}
                        className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-primary-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (videoRef.current) {
                            setVideoTime(Math.floor(videoRef.current.currentTime));
                          }
                        }}
                        className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-[10px] font-bold text-zinc-300 transition-colors"
                      >
                        Capturar actual
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400">Contenido detallado de tu pregunta</label>
                  <textarea
                    name="contenido"
                    rows={2}
                    required
                    placeholder="Explica qué problema tienes..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full text-xs">
                  Publicar Pregunta
                </Button>
              </form>
              {qaMsg && <p className="text-xs text-emerald-400 font-semibold text-center">{qaMsg}</p>}

              {/* Lista */}
              <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                            q.resuelta
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-amber-950 text-amber-400"
                          }`}>
                            {q.resuelta ? "Resuelta" : "Pendiente"}
                          </span>
                          {q.videoSegundo !== null && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-primary-400">
                              <Clock className="h-2.5 w-2.5" />
                              Min {Math.floor(q.videoSegundo / 60)}:{(q.videoSegundo % 60).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-xs text-zinc-100">{q.titulo}</p>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{q.contenido}</p>
                      </div>
                      <Link
                        href={`/dashboard/student/qanda/${q.id}`}
                        target="_blank"
                        className="shrink-0 rounded bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-[9px] font-bold text-zinc-300 transition-colors"
                      >
                        Ver respuestas
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 py-4 text-center">Nadie ha preguntado sobre este curso todavía. ¡Sé el primero!</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Valorar */}
          {activeTab === "review" && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-zinc-200">Dejar Reseña sobre este Curso</h4>
              
              {computedProgress >= 20 ? (
                <div>
                  <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-md">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-zinc-400">Calificación (Estrellas)</label>
                      <select
                        name="estrellas"
                        defaultValue={userReview?.estrellas ?? "5"}
                        className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-primary-500 focus:outline-none"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                        <option value="4">⭐⭐⭐⭐ (Bueno)</option>
                        <option value="3">⭐⭐⭐ (Regular)</option>
                        <option value="2">⭐⭐ (Malo)</option>
                        <option value="1">⭐ (Muy malo)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-zinc-400">Comentario</label>
                      <textarea
                        name="comentario"
                        rows={3}
                        required
                        defaultValue={userReview?.comentario ?? ""}
                        placeholder="Escribe tu opinión sobre el curso..."
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    <Button type="submit" size="sm" className="text-xs">
                      {userReview ? "Actualizar Reseña" : "Enviar Reseña"}
                    </Button>
                  </form>
                  {reviewMsg && <p className="mt-2 text-xs text-emerald-400 font-semibold">{reviewMsg}</p>}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center space-y-2">
                  <HelpCircle className="mx-auto h-8 w-8 text-zinc-600" />
                  <p className="text-xs text-zinc-400">
                    Necesitas completar al menos el **20% del curso** para poder valorarlo.
                  </p>
                  <p className="text-[10px] text-zinc-500">Tu progreso actual es: {computedProgress}%</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Sesión en Vivo */}
          {activeTab === "mentor" && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-zinc-200">Llamadas de Mentoría y Apoyo en Vivo</h4>
              {liveMeetLink ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-primary-400 font-bold">
                    <Clock className="h-4 w-4 animate-pulse" />
                    <span>Llamada de Apoyo Programada</span>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">
                      Fecha de la sesión: <span className="font-semibold text-zinc-200">{liveMeetFecha ? new Date(liveMeetFecha).toLocaleString("es-ES") : "Por definir"}</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate max-w-md mt-1">{liveMeetLink}</p>
                  </div>
                  <a
                    href={liveMeetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Unirse a la sesión
                  </a>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4 text-center">
                  El instructor no ha programado ninguna mentoría en vivo para este curso en este momento.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Temario (Right) */}
      {sidebarOpen && (
        <aside className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-zinc-900 bg-zinc-900/50 p-4 md:p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-widest">Temario del Curso</h3>
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Progreso del Curso</span>
              <span className="font-bold text-zinc-200">{computedProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300"
                style={{ width: `${computedProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((sec) => {
              const secLessons = lessons.filter(l => l.sectionId === sec.id);
              return (
                <div key={sec.id} className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-400 truncate border-b border-zinc-800 pb-1">
                    {sec.orden}. {sec.titulo}
                  </h4>
                  <div className="grid gap-1">
                    {secLessons.map((les) => {
                      const isCompleted = completedIds.includes(les.id);
                      const isCurrent = les.id === currentLesson.id;
                      
                      return (
                        <div 
                          key={les.id} 
                          className={`flex items-center justify-between gap-2 p-2 rounded-lg text-xs transition ${
                            isCurrent 
                              ? "bg-zinc-850 border border-zinc-850" 
                              : "hover:bg-zinc-800/40"
                          }`}
                        >
                          <button
                            onClick={() => handleLessonCheckboxToggle(les.id)}
                            title={isCompleted ? "Marcar como incompleto" : "Marcar como completado"}
                            className="shrink-0 text-zinc-500 hover:text-zinc-300 transition"
                          >
                            {isCompleted ? (
                              <CheckSquare className="h-4 w-4 text-primary-500" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                          
                          <Link
                            href={`/courses/${course.id}/lessons/${les.id}`}
                            className={`min-w-0 flex-1 truncate hover:underline ${
                              isCurrent ? "font-semibold text-primary-400" : "text-zinc-300"
                            }`}
                          >
                            {les.titulo}
                          </Link>

                          {les.esGratis && (
                            <span className="shrink-0 rounded bg-emerald-950 px-1 py-0.5 text-[8px] font-bold text-emerald-400 uppercase">
                              Gratis
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
