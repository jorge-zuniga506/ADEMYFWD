"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { optimizeCourseDescriptionAction } from "@/lib/actions/ai";
import { showAlert } from "@/lib/alert";

interface AiDescriptionButtonProps {
  titulo: string;
  categoryName: string;
  textareaSelectorName?: string;
}

export default function AiDescriptionButton({
  titulo,
  categoryName,
  textareaSelectorName = "descripcion",
}: AiDescriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    // Buscar el textarea en el DOM
    const textarea = document.querySelector(`textarea[name="${textareaSelectorName}"]`) as HTMLTextAreaElement;
    
    if (!textarea) {
      showAlert({
        title: "Error",
        text: "No se encontró el campo de descripción en la página.",
        icon: "error",
      });
      return;
    }

    const currentVal = textarea.value.trim();
    setLoading(true);

    try {
      const optimized = await optimizeCourseDescriptionAction(titulo, categoryName, currentVal);
      
      // Asignar el valor optimizado con un efecto visual limpio
      textarea.value = optimized;
      
      showAlert({
        title: "¡Descripción Optimizada!",
        text: "La inteligencia artificial ha mejorado la descripción del curso con éxito.",
        icon: "success",
      });
    } catch (err: any) {
      showAlert({
        title: "Error",
        text: err.message || "No se pudo optimizar la descripción.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOptimize}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50 cursor-pointer self-end"
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Optimizando...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3" />
          <span>Mejorar con IA</span>
        </>
      )}
    </button>
  );
}
