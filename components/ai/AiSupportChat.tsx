"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Loader2, Sparkles } from "lucide-react";
import { askAiSupportAction } from "@/lib/actions/ai-moderation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy Ademy, tu asistente inteligente de soporte técnico. ¿En qué puedo ayudarte hoy con la plataforma U-Forward Academy?"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat en nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMsg = inputVal.trim();
    setInputVal("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Mapear historial al formato requerido por la Server Action
      const history = [...messages, { role: "user", content: userMsg }].map(m => ({
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
          content: "Disculpa, tengo problemas para conectarme al servicio de soporte en este momento. Por favor, intenta de nuevo."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
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
            Soporte IA U-Forward
          </span>
        </button>
      )}

      {/* Globo de Chat Conversacional */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
          
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
                <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">Asistente de Soporte IA</p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-2 scrollbar-thin">
            {messages.map((m, idx) => {
              const isAi = m.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isAi
                      ? "bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-850"
                      : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-tr-none"
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            
            {/* Loader de carga de la IA */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 text-zinc-400 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-2 border border-zinc-850">
                  <Loader2 className="h-3 w-3 animate-spin text-purple-400" />
                  <span>Escribiendo respuesta...</span>
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
              placeholder="Pregúntame sobre membresías, pagos..."
              className="flex-1 h-9 rounded-xl border border-zinc-855 bg-zinc-900 px-3 text-xs text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-40 disabled:hover:bg-purple-600 cursor-pointer shadow-lg shadow-purple-600/10 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
