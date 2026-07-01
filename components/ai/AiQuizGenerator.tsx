"use client";

import { useState } from "react";
import { Sparkles, Loader2, ClipboardCheck, Clipboard, Plus, X, BookOpen } from "lucide-react";
import { generateCourseQuizAction, addQuizLessonAction } from "@/lib/actions/ai";
import { showAlert } from "@/lib/alert";

interface Section {
  id: string;
  titulo: string;
  orden: number;
}

interface AiQuizGeneratorProps {
  courseId: string;
  tituloCurso: string;
  sections: Section[];
}

export default function AiQuizGenerator({
  courseId,
  tituloCurso,
  sections,
}: AiQuizGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [quizContent, setQuizContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Para agregar como lección
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("Examen de Evaluación General del Curso");
  const [savingLesson, setSavingLesson] = useState(false);

  const handleGenerate = async () => {
    if (sections.length === 0) {
      showAlert({
        title: "Atención",
        text: "Por favor, crea al menos una sección en el curso para que la IA entienda el temario y pueda formular las preguntas.",
        icon: "warning",
      });
      return;
    }

    setIsOpen(true);
    setGenerating(true);
    setQuizContent(null);
    setCopied(false);

    try {
      const seccionTitulos = sections.map(s => s.titulo);
      const generated = await generateCourseQuizAction(tituloCurso, seccionTitulos);
      setQuizContent(generated);
    } catch (err: any) {
      showAlert({
        title: "Error",
        text: err.message || "No se pudo generar el examen.",
        icon: "error",
      });
      setIsOpen(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!quizContent) return;
    navigator.clipboard.writeText(quizContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showAlert({
      title: "Copiado",
      text: "Examen copiado al portapapeles con éxito.",
      icon: "success",
    });
  };

  const handleAddLesson = async () => {
    if (!quizContent || !selectedSectionId) {
      showAlert({
        title: "Atención",
        text: "Por favor selecciona una sección para agregar el examen.",
        icon: "warning",
      });
      return;
    }

    setSavingLesson(true);

    try {
      await addQuizLessonAction(courseId, selectedSectionId, lessonTitle, quizContent);
      setIsOpen(false);
      await showAlert({
        title: "¡Examen Añadido!",
        text: `El examen se ha creado como una nueva lección en la sección seleccionada y el archivo de texto se adjuntó como recurso descargable de forma exitosa.`,
        icon: "success",
      });
      window.location.reload();
    } catch (err: any) {
      showAlert({
        title: "Error",
        text: err.message || "No se pudo añadir la lección de examen.",
        icon: "error",
      });
    } finally {
      setSavingLesson(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleGenerate}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:from-cyan-400 hover:to-purple-500 transition shadow-lg shadow-purple-500/10 cursor-pointer"
      >
        <Sparkles className="h-4 w-4" />
        Generar Examen con IA
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Generador de Evaluaciones IA</h3>
                  <p className="text-xs text-zinc-500">Curso: {tituloCurso}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido / Loader */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
              {generating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                  <p className="text-sm text-zinc-400 font-semibold animate-pulse">
                    Analizando el temario y formulando cuestionario...
                  </p>
                  <p className="text-xs text-zinc-600 max-w-xs text-center">
                    La inteligencia artificial está estructurando 10 preguntas de opción múltiple con sus respectivas respuestas correctas.
                  </p>
                </div>
              ) : quizContent ? (
                <div className="space-y-6">
                  {/* Vista previa del examen */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Vista Previa del Examen (.txt)</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                      >
                        {copied ? <ClipboardCheck className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
                        {copied ? "¡Copiado!" : "Copiar Cuestionario"}
                      </button>
                    </div>
                    <pre className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-mono overflow-x-auto overflow-y-auto max-h-60 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {quizContent}
                    </pre>
                  </div>

                  {/* Formulario de creación de lección */}
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Integrar Examen al Curso</h4>
                    <p className="text-xs text-zinc-500">
                      Crea automáticamente una nueva lección en tu curso con el examen adjunto como recurso descargable de texto para los estudiantes.
                    </p>
                    
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Seleccionar Sección</label>
                        <select
                          value={selectedSectionId}
                          onChange={(e) => setSelectedSectionId(e.target.value)}
                          className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="">Seleccionar...</option>
                          {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                              Sección {s.orden}: {s.titulo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Título de la Lección</label>
                        <input
                          type="text"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          placeholder="Ej. Cuestionario de Evaluación Final"
                          className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddLesson}
                      disabled={savingLesson || !selectedSectionId}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      {savingLesson ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Guardando Lección de Examen...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Crear Lección con Examen de IA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer del Modal */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 px-4 py-2 font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
