"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { askAiSupportAction } from "@/lib/actions/ai-moderation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Chips de acciones rápidas según el rol del usuario
const QUICK_ACTIONS: Record<string, { label: string; prompt: string }[]> = {
  ADMIN: [
    { label: "👥 Usuarios hoy vs ayer", prompt: "¿Cuántos usuarios nuevos hay hoy y ayer?" },
    { label: "📧 Consumo de Gmail", prompt: "¿Cuántos correos se han enviado hoy de los 500 disponibles?" },
    { label: "🤖 Consumo de IA", prompt: "¿Cuántas peticiones de IA se han hecho hoy?" },
    { label: "📚 Estado de cursos", prompt: "¿Cuántos cursos están publicados y cuántos en revisión?" },
    { label: "🎓 Total inscripciones", prompt: "¿Cuántas inscripciones activas hay en la plataforma?" },
    { label: "📊 Resumen general", prompt: "Dame un resumen completo del estado actual de la plataforma." },
  ],
  INSTRUCTOR: [
    { label: "📚 Ver mis cursos", prompt: "¿Cómo accedo al panel de gestión de mis cursos?" },
    { label: "🤖 Auditoría IA", prompt: "¿Cómo funciona la auditoría automática de cursos por IA?" },
    { label: "💰 Mis ingresos", prompt: "¿Cómo puedo ver mis ingresos y solicitar un retiro?" },
    { label: "🏅 Verificación VIP", prompt: "¿Cómo puedo verificarme como instructor VIP FWD?" },
  ],
  ESTUDIANTE: [
    { label: "📚 Ver mis cursos", prompt: "¿Cómo accedo a mis cursos?" },
    { label: "🎓 Mi certificado", prompt: "¿Cómo descargo mi certificado al completar un curso?" },
    { label: "💳 Membresía VIP", prompt: "¿Qué incluye la membresía VIP Pro Max y cuánto cuesta?" },
    { label: "💬 Foro de dudas", prompt: "¿Cómo puedo hacer una pregunta en el foro de una lección?" },
  ],
};

interface AiSupportChatProps {
  userRol?: string;
}

export default function AiSupportChat({ userRol = "ESTUDIANTE" }: AiSupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: userRol === "ADMIN"
        ? "¡Hola! Soy Ademy, tu asistente de datos en tiempo real. Puedo consultarte métricas de usuarios, cursos, correos y consumo de IA directamente desde la base de datos. ¿Qué necesitas saber?"
        : userRol === "INSTRUCTOR"
        ? "¡Hola! Soy Ademy, tu asistente de soporte. Te ayudo con la gestión de tus cursos, ingresos y verificación VIP. ¿En qué puedo ayudarte?"
        : "¡Hola! Soy Ademy, tu asistente de soporte en U-Forward Academy. ¿En qué puedo ayudarte hoy?"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickActionsUsed, setQuickActionsUsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = QUICK_ACTIONS[userRol] || QUICK_ACTIONS.ESTUDIANTE;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setInputVal("");
    setQuickActionsUsed(true);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const history = [...messages, { role: "user", content: text }].map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      }));

      const reply = await askAiSupportAction(history);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: err.message?.includes("límite diario")
            ? err.message
            : "Disculpa, tengo problemas para conectarme al servicio de soporte en este momento. Por favor, intenta de nuevo."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputVal);
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 font-sans">
      {/* Botón Flotante de Apertura */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative group cursor-pointer border border-white/10"
        >
          <img
            src="/images/ademy-logo.png"
            alt="Ademy Logo"
            className="h-9 w-9 rounded-full object-cover group-hover:rotate-6 transition-transform duration-300 border border-white/20 shadow-md"
          />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
          </span>
          <span className="absolute right-16 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            {userRol === "ADMIN" ? "Ademy — Datos en Tiempo Real" : "Ademy — Soporte IA"}
          </span>
        </button>
      )}

      {/* Globo de Chat Conversacional */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[520px] rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">

          {/* Cabecera del Chat */}
          <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-zinc-950 p-4 border-b border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 shadow-inner overflow-hidden">
                <img
                  src="/images/ademy-logo.png"
                  alt="Ademy Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Ademy
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </h4>
                <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">
                  {userRol === "ADMIN" ? "Asistente de Datos IA" : "Asistente de Soporte IA"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-white transition p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((m, idx) => {
              const isAi = m.role === "assistant";
              return (
                <div key={idx} className={`flex ${isAi ? "justify-start" : "justify-end"}`}>
                  {isAi && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden mr-2 mt-0.5 border border-zinc-800">
                      <img src="/images/ademy-logo.png" alt="Ademy" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isAi
                      ? "bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800"
                      : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-tr-none"
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })}

            {/* Loader de carga */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full overflow-hidden mr-2 mt-0.5 border border-zinc-800">
                  <img src="/images/ademy-logo.png" alt="Ademy" className="h-full w-full object-cover" />
                </div>
                <div className="bg-zinc-900 text-zinc-400 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2 border border-zinc-800">
                  <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                  <span>Consultando datos...</span>
                </div>
              </div>
            )}

            {/* Chips de Acciones Rápidas — solo cuando hay 1 solo mensaje inicial */}
            {messages.length === 1 && !loading && !quickActionsUsed && (
              <div className="pt-1">
                <p className="text-[10px] text-zinc-600 mb-2 pl-7 font-medium">Accesos rápidos:</p>
                <div className="flex flex-wrap gap-1.5 pl-7">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(action.prompt)}
                      className="rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-purple-700 text-zinc-300 hover:text-white text-[10px] px-2.5 py-1 transition-all duration-200 cursor-pointer font-medium"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-zinc-900 bg-zinc-950 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={userRol === "ADMIN" ? "Pregunta por métricas, usuarios..." : "Pregúntame sobre membresías, pagos..."}
              className="flex-1 h-9 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-40 cursor-pointer shadow-lg shadow-purple-600/10 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
