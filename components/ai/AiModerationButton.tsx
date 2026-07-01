"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { submitCourseToAiReviewAction } from "@/lib/actions/ai-moderation";
import { showAlert } from "@/lib/alert";
import Swal from "sweetalert2";

interface AiModerationButtonProps {
  courseId: string;
  estadoActual: string;
}

export default function AiModerationButton({
  courseId,
  estadoActual,
}: AiModerationButtonProps) {
  const [loading, setLoading] = useState(false);

  if (estadoActual !== "BORRADOR") return null;

  const handleReview = async () => {
    const confirm = await Swal.fire({
      title: "¿Enviar a Auditoría IA?",
      text: "Nuestra inteligencia artificial analizará el temario, la duración y la descripción del curso para verificar si cumple las reglas de la academia y publicarlo al instante.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
      background: "#09090b",
      color: "#ffffff",
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#27272a",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);

    // Alerta de carga
    Swal.fire({
      title: "Auditoría en Progreso...",
      text: "La IA está validando el contenido, las lecciones y las directrices del curso.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: "#09090b",
      color: "#ffffff",
    });

    try {
      const res = await submitCourseToAiReviewAction(courseId);
      
      if (res.aprobado) {
        await Swal.fire({
          title: "🎉 ¡Curso Aprobado!",
          text: `La IA ha publicado tu curso con éxito. Motivo: ${res.motivo}`,
          icon: "success",
          background: "#09090b",
          color: "#ffffff",
          confirmButtonColor: "#10b981",
        });
      } else {
        await Swal.fire({
          title: "⚠️ Se requieren correcciones",
          text: `El curso ha sido devuelto a Borrador. Motivo: ${res.motivo}`,
          icon: "warning",
          background: "#09090b",
          color: "#ffffff",
          confirmButtonColor: "#f59e0b",
        });
      }
      window.location.reload();
    } catch (err: any) {
      await Swal.fire({
        title: "Error",
        text: err.message || "Ocurrió un error inesperado durante la auditoría.",
        icon: "error",
        background: "#09090b",
        color: "#ffffff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleReview}
      disabled={loading}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 transition-colors disabled:opacity-50 cursor-pointer self-start shadow-md shadow-emerald-500/10"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Auditando...</span>
        </>
      ) : (
        <>
          <Send className="h-3.5 w-3.5" />
          <span>Enviar a Auditoría IA</span>
        </>
      )}
    </button>
  );
}
