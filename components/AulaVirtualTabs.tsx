"use client";

import { useState, useRef } from "react";
import { Users, Video, Megaphone, MessageSquare, ExternalLink, Calendar, CheckCircle2, Clock } from "lucide-react";
import { saveLiveMeet, sendAnnouncement, generateGoogleMeetLink } from "@/lib/actions/instructor";
import { Button } from "./ui";
import { showAlert } from "@/lib/alert";

interface Course {
  id: string;
  titulo: string;
  liveMeetLink: string | null;
  liveMeetFecha: string | null;
}

interface Enrollment {
  userId: string;
  courseId: string;
  progreso: number;
  User: {
    nombre: string;
    email: string;
  };
}

interface Question {
  id: string;
  titulo: string;
  contenido: string;
  fechaCreacion: string;
  resuelta: boolean;
  videoSegundo: number | null;
  Course: {
    titulo: string;
  };
  User: {
    nombre: string;
  };
}

export default function AulaVirtualTabs({
  cursos,
  enrollments,
  questions
}: {
  cursos: Course[];
  enrollments: Enrollment[];
  questions: Question[];
}) {
  const [activeTab, setActiveTab] = useState<"estudiantes" | "clases" | "anuncios" | "preguntas">("estudiantes");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [payoutMsg, setPayoutMsg] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(cursos[0]?.id ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const meetLinkRef = useRef<HTMLInputElement>(null);
  const meetDateRef = useRef<HTMLInputElement>(null);

  const selectedCourse = cursos.find((c) => c.id === selectedCourseId);

  const formatDateTimeLocal = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const courseId = formData.get("courseId") as string;
    try {
      const res = await sendAnnouncement(courseId, formData);
      setAnnouncementMsg(res.message);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setAnnouncementMsg(""), 5000);
    } catch (err: any) {
      setAnnouncementMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("estudiantes")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "estudiantes"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          <Users className="h-4 w-4" />
          Estudiantes Activos
        </button>
        <button
          onClick={() => setActiveTab("clases")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "clases"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          <Video className="h-4 w-4" />
          Clases en Vivo (Zoom/Meet)
        </button>
        <button
          onClick={() => setActiveTab("anuncios")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "anuncios"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Anuncios por Correo
        </button>
        <button
          onClick={() => setActiveTab("preguntas")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-all ${
            activeTab === "preguntas"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Preguntas de Alumnos ({questions.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="min-h-[400px]">
        {/* TAB 1: Estudiantes Activos */}
        {activeTab === "estudiantes" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Estudiantes Matriculados</h3>
            {enrollments.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Estudiante</th>
                      <th className="px-4 py-3 font-medium">Curso</th>
                      <th className="px-4 py-3 font-medium">Progreso</th>
                      <th className="px-4 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {enrollments.map((e) => {
                      const curso = cursos.find((c) => c.id === e.courseId);
                      return (
                        <tr key={`${e.userId}-${e.courseId}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-zinc-950 dark:text-zinc-50">{e.User.nombre}</p>
                            <p className="text-xs text-zinc-400">{e.User.email}</p>
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{curso?.titulo}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                <div
                                  className="h-full rounded-full bg-primary-500"
                                  style={{ width: `${e.progreso}%` }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-zinc-500">{e.progreso}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {curso && (
                              <a
                                href={`/courses/${curso.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Ir al curso
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
                <Users className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Aún no tienes estudiantes inscritos en tus cursos.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Clases en Vivo */}
        {activeTab === "clases" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Programar Clase en Vivo</h3>
              <form action={saveLiveMeet} key={selectedCourseId} className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                try {
                  await saveLiveMeet(formData);
                  await showAlert({
                    title: "¡Configuración Exitosa!",
                    text: "Clase en vivo configurada con éxito.",
                    icon: "success"
                  });
                  window.location.reload();
                } catch (err: any) {
                  showAlert({ title: "Error", text: err.message, icon: "error" });
                }
              }}>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Seleccionar Curso</label>
                  <select
                    name="courseId"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                  >
                    {cursos.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {c.titulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Enlace de la llamada (Zoom, Meet, Teams)</label>
                  <div className="flex gap-2">
                    <input
                      ref={meetLinkRef}
                      name="liveMeetLink"
                      placeholder="https://meet.google.com/abc-defg-hij"
                      defaultValue={selectedCourse?.liveMeetLink ?? ""}
                      required
                      className="flex-1 rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const dateVal = meetDateRef.current?.value;
                        if (!dateVal) {
                          showAlert({
                            title: "Atención",
                            text: "Por favor, selecciona primero la fecha y hora de la mentoría.",
                            icon: "warning"
                          });
                          return;
                        }
                        try {
                          setIsGenerating(true);
                          const res = await generateGoogleMeetLink(selectedCourseId, selectedCourse?.titulo ?? "", dateVal);
                          if (res.success && meetLinkRef.current) {
                            meetLinkRef.current.value = res.link;
                            if (res.isSimulated) {
                              showAlert({
                                title: "Enlace Generado",
                                text: `Enlace generado con éxito.\n\nNota: ${res.message}`,
                                icon: "success"
                              });
                            } else {
                              showAlert({
                                title: "¡Llamada Generada!",
                                text: "¡Llamada de Google Meet generada de forma real y exitosa!",
                                icon: "success"
                              });
                            }
                          }
                        } catch (err: any) {
                          showAlert({
                            title: "Error",
                            text: "Error al generar enlace: " + err.message,
                            icon: "error"
                          });
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      disabled={isGenerating}
                      className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 px-4 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isGenerating ? "Generando..." : "Generar con Meet"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Fecha y Hora de la mentoría</label>
                  <input
                    ref={meetDateRef}
                    name="liveMeetFecha"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(selectedCourse?.liveMeetFecha ?? null)}
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full">
                  Actualizar Mentoría
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Enlaces de Mentoría Activos</h3>
              {cursos.some(c => c.liveMeetLink) ? (
                <div className="grid gap-3">
                  {cursos.filter(c => c.liveMeetLink).map((c) => (
                    <div key={c.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex justify-between items-start">
                      <div className="space-y-1.5 min-w-0 flex-1 pr-2">
                        <p className="font-semibold text-sm truncate">{c.titulo}</p>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{c.liveMeetFecha ? new Date(c.liveMeetFecha).toLocaleString("es-ES") : "Sin fecha"}</span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate break-all">{c.liveMeetLink}</p>
                      </div>
                      <a
                        href={c.liveMeetLink!}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-primary-50 text-primary-600 p-2 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
                  <Video className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-xs text-zinc-400">No tienes ninguna llamada de mentoría activa.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Anuncios Masivos */}
        {activeTab === "anuncios" && (
          <div className="max-w-xl mx-auto rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Enviar Anuncio Masivo por Correo</h3>
            <p className="text-xs text-zinc-500">
              Esta herramienta enviará una notificación por correo electrónico a todos los alumnos matriculados en el curso seleccionado.
            </p>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Seleccionar Curso</label>
                <select
                  name="courseId"
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white dark:bg-zinc-900 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                >
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {c.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Título del Anuncio</label>
                <input
                  name="titulo"
                  placeholder="Ej: Nueva sesión de mentoría agregada o Sección actualizada"
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Contenido del Anuncio</label>
                <textarea
                  name="contenido"
                  rows={5}
                  placeholder="Escribe el mensaje para tus estudiantes aquí..."
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                />
              </div>

              <Button type="submit" size="sm" className="w-full">
                Enviar Anuncio Masivo
              </Button>
            </form>
            {announcementMsg && (
              <p className="text-sm text-center text-emerald-600 font-medium">{announcementMsg}</p>
            )}
          </div>
        )}

        {/* TAB 4: Preguntas y Respuestas */}
        {activeTab === "preguntas" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Preguntas Recientes de Alumnos</h3>
            {questions.length > 0 ? (
              <div className="grid gap-4">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                          q.resuelta
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}>
                          {q.resuelta ? "Resuelta" : "Pendiente"}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500">{q.Course.titulo}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{q.titulo}</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{q.contenido}</p>
                      
                      <div className="flex items-center gap-2 pt-2 text-[10px] text-zinc-400">
                        <span>Por: {q.User.nombre}</span>
                        <span>&middot;</span>
                        <span>{new Date(q.fechaCreacion).toLocaleDateString()}</span>
                        {q.videoSegundo !== null && (
                          <>
                            <span>&middot;</span>
                            <span className="flex items-center gap-0.5 text-primary-600 dark:text-primary-400">
                              <Clock className="h-3 w-3" />
                              Minuto: {Math.floor(q.videoSegundo / 60)}:{(q.videoSegundo % 60).toString().padStart(2, '0')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <a
                      href={`/dashboard/student/qanda/${q.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-850 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Responder
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-xs text-zinc-400">No hay ninguna pregunta de alumnos en este momento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
