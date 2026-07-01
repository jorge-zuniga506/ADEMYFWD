"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { suggestSectionAction } from "@/lib/actions/ai";
import { showAlert } from "@/lib/alert";

interface AiSectionButtonProps {
  tituloCurso: string;
}

export default function AiSectionButton({ tituloCurso }: AiSectionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSuggest = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Buscar el input de título de sección dentro del formulario más cercano
    const parentDetails = e.currentTarget.closest("details");
    const input = parentDetails?.querySelector('input[name="titulo"]') as HTMLInputElement;

    if (!input) {
      showAlert({
        title: "Error",
        text: "No se encontró el campo de título de sección.",
        icon: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const suggestion = await suggestSectionAction(tituloCurso);
      input.value = suggestion;
      
      showAlert({
        title: "¡Sección Sugerida!",
        text: `La IA sugiere el título: "${suggestion}"`,
        icon: "success",
      });
    } catch (err: any) {
      showAlert({
        title: "Error",
        text: err.message || "No se pudo sugerir la sección.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSuggest}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors disabled:opacity-50 cursor-pointer self-start"
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Sugiriendo...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-3 w-3" />
          <span>Sugerir Sección con IA</span>
        </>
      )}
    </button>
  );
}
