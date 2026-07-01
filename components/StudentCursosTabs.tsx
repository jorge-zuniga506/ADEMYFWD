"use client";

import { useState } from "react";
import { BookOpen, PlayCircle, Archive, RotateCcw, Award } from "lucide-react";
import { toggleArchiveCourse } from "@/lib/actions/student";
import Link from "next/link";
import { showAlert } from "@/lib/alert";

interface Course {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  instructorId: string;
  User: {
    nombre: string;
  };
}

interface Enrollment {
  courseId: string;
  progreso: number;
  completado: boolean;
  archivado: boolean;
  lastLessonId: string | null;
  Course: Course;
}

export default function StudentCursosTabs({
  initialEnrollments,
  lastLesson,
  lastCourse
}: {
  initialEnrollments: Enrollment[];
  lastLesson: { id: string; titulo: string } | null;
  lastCourse: Course | null;
}) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(initialEnrollments);
  const [activeTab, setActiveTab] = useState<"activos" | "archivados">("activos");

  const handleArchive = async (courseId: string, archive: boolean) => {
    try {
      await toggleArchiveCourse(courseId, archive);
      setEnrollments(prev =>
        prev.map(e => (e.courseId === courseId ? { ...e, archivado: archive } : e))
      );
    } catch (err: any) {
      showAlert({ title: "Error", text: err.message, icon: "error" });
    }
  };

  const activeCursos = enrollments.filter(e => !e.archivado);
  const archivedCursos = enrollments.filter(e => e.archivado);

  const currentList = activeTab === "activos" ? activeCursos : archivedCursos;

  return (
    <div className="space-y-8">
      {/* Continuar Viendo Banner */}
      {lastCourse && activeTab === "activos" && (
        <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-500/10 to-transparent p-6 dark:border-primary-950/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">CONTINUAR APRENDIENDO</span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{lastCourse.titulo}</h3>
              <p className="text-xs text-zinc-500">
                Última clase: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{lastLesson?.titulo || "Clase inicial"}</span>
              </p>
            </div>
            <Link
              href={lastLesson ? `/courses/${lastCourse.id}/lessons/${lastLesson.id}` : `/courses/${lastCourse.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-all hover:scale-102"
            >
              <PlayCircle className="h-4 w-4" />
              Reanudar clase
            </Link>
          </div>
        </div>
      )}

      {/* Tabs Selector */}
      <div className="flex gap-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("activos")}
          className={`border-b-2 pb-2.5 text-sm font-medium transition-all ${
            activeTab === "activos"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          }`}
        >
          Cursos Activos ({activeCursos.length})
        </button>
        <button
          onClick={() => setActiveTab("archivados")}
          className={`border-b-2 pb-2.5 text-sm font-medium transition-all ${
            activeTab === "archivados"
              ? "border-primary-500 text-primary-600 dark:text-primary-400"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
          }`}
        >
          Cursos Archivados ({archivedCursos.length})
        </button>
      </div>

      {/* Grid de Cursos */}
      {currentList.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {currentList.map((enr) => {
            const course = enr.Course;
            return (
              <div
                key={enr.courseId}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="font-semibold text-zinc-900 group-hover:text-primary-600 dark:text-zinc-50 transition-colors line-clamp-1">
                      {course.titulo}
                    </h3>
                    <button
                      onClick={() => handleArchive(enr.courseId, !enr.archivado)}
                      title={enr.archivado ? "Restaurar curso" : "Archivar curso"}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition p-1"
                    >
                      {enr.archivado ? (
                        <RotateCcw className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">
                    Instructor: {course.User?.nombre}
                  </p>

                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                        style={{ width: `${enr.progreso}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-500">
                      {enr.progreso}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800">
                  {enr.completado ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Award className="h-3 w-3" />
                      Completado
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400">
                      En progreso
                    </span>
                  )}
                  <Link
                    href={enr.lastLessonId ? `/courses/${course.id}/lessons/${enr.lastLessonId}` : `/courses/${course.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Estudiar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            {activeTab === "activos"
              ? "No tienes cursos activos."
              : "No tienes cursos archivados."}
          </p>
          {activeTab === "activos" && (
            <Link
              href="/"
              className="text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
            >
              Explorar catálogo de cursos &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
