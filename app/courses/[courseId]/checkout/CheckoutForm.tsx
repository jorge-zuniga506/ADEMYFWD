"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface CheckoutFormProps {
  course: {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    esExclusivoFwd: boolean;
    categoryId: string;
  };
  firstLessonId: string;
  userEmail: string;
  membershipTipo?: string | null;
  descuentoPorcentaje?: number;
}

const categoryImages: Record<string, string> = {
  "a1e0ee0c-83b3-4f51-b0e7-8be5f2f46e01": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
  "b2e0ee0c-83b3-4f51-b0e7-8be5f2f46e02": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
  "c3e0ee0c-83b3-4f51-b0e7-8be5f2f46e03": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
  "d4e0ee0c-83b3-4f51-b0e7-8be5f2f46e04": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
  "e5e0ee0c-83b3-4f51-b0e7-8be5f2f46e05": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "f6e0ee0c-83b3-4f51-b0e7-8be5f2f46e06": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
  "a7e0ee0c-83b3-4f51-b0e7-8be5f2f46e07": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "b8e0ee0c-83b3-4f51-b0e7-8be5f2f46e08": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80",
  "c9e0ee0c-83b3-4f51-b0e7-8be5f2f46e09": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  "dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80"
};

const courseImages: Record<string, string> = {
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e13": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e17": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e16": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e14": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e18": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e19": "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e20": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e21": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e22": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e23": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e24": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e25": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e26": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e27": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e28": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e29": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e30": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e31": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e32": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e33": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e34": "https://images.unsplash.com/photo-1684126743128-44bd7ea1f0c2?auto=format&fit=crop&w=800&q=80",
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e35": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80",
};

export default function CheckoutForm({
  course,
  firstLessonId,
  userEmail,
  membershipTipo,
  descuentoPorcentaje = 0,
}: CheckoutFormProps) {
  const router = useRouter();
  const isProMax = membershipTipo === "PRO_MAX";
  const finalPrice = isProMax ? 0 : course.precio * (1 - descuentoPorcentaje / 100);
  const [activeTab, setActiveTab] = useState<"card" | "paypal" | "transfer">("card");
  
  // Card states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  
  // Simulated logic
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const imageUrl = courseImages[course.id] || categoryImages[course.categoryId] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";

  // Formats card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted.substring(0, 19));
  };

  // Formats expiry date input
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setCardExpiry(value.substring(0, 5));
  };

  const detectCardType = () => {
    const raw = cardNumber.replace(/\s/g, "");
    if (raw.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(raw)) return "Mastercard";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Field validation if paying via card
    if (activeTab === "card") {
      if (!cardName) {
        setErrorMsg("El nombre del tarjetahabiente es obligatorio.");
        return;
      }
      if (cardNumber.replace(/\s/g, "").length < 16) {
        setErrorMsg("Número de tarjeta inválido (debe tener 16 dígitos).");
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMsg("Fecha de vencimiento inválida.");
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg("El código de seguridad (CVV) es obligatorio.");
        return;
      }
    }

    setLoading(true);

    // Simulated payment steps
    const steps = [
      "Estableciendo conexión segura SSL...",
      "Validando datos de cuenta...",
      "Procesando transacción bancaria simulada...",
      "Aprobando fondos en pasarela...",
      "Creando inscripción y credencial académica..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      // Execute the database enrollment
      const res = await fetch(`/api/enroll/${course.id}`, { method: "POST" });
      if (!res.ok) {
        throw new Error("No se pudo completar la inscripción en la base de datos.");
      }

      setLoading(false);
      setSuccess(true);

      // Show success screen for 2.5 seconds, then push to the lesson page or student dashboard
      setTimeout(() => {
        if (firstLessonId) {
          router.push(`/courses/${course.id}/lessons/${firstLessonId}`);
        } else {
          router.push(`/dashboard/student`);
        }
        router.refresh();
      }, 2500);

    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Ocurrió un error inesperado al procesar la compra.";
      setErrorMsg(errMsg);
      setLoading(false);
    }
  };

  const handleFreeEnroll = async () => {
    setErrorMsg("");
    setLoading(true);
    setLoadingStep("Activando tu inscripción Pro Max...");

    try {
      const res = await fetch(`/api/enroll/${course.id}`, { method: "POST" });
      if (!res.ok) {
        throw new Error("No se pudo completar la inscripción en la base de datos.");
      }

      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
        if (firstLessonId) {
          router.push(`/courses/${course.id}/lessons/${firstLessonId}`);
        } else {
          router.push(`/dashboard/student`);
        }
        router.refresh();
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Ocurrió un error inesperado al procesar la inscripción.";
      setErrorMsg(errMsg);
      setLoading(false);
    }
  };

  if (isProMax) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
        {success && (
          <div className="absolute inset-0 bg-[#0b0c10]/95 flex flex-col items-center justify-center text-center p-8 z-50 rounded-2xl border border-zinc-800">
            <div className="h-20 w-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-bounce">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">¡Inscripción confirmada!</h2>
            <p className="text-zinc-400 text-sm max-w-md mt-2 leading-relaxed">
              Tu membresía Pro Max cubrió el costo de <strong className="text-zinc-100">{course.titulo}</strong>.
            </p>
          </div>
        )}

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#13141c] border border-yellow-800/40 rounded-2xl p-6 md:p-8 space-y-5 text-center">
            <div className="h-14 w-14 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto">
              <ShieldCheck className="h-7 w-7 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Este curso está incluido en tu Pro Max</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                No se te cobrará nada — tu membresía Pro Max incluye todos los cursos de la plataforma.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-950/30 border border-rose-800/40 text-rose-400 p-4 rounded-xl text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="button"
              onClick={handleFreeEnroll}
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-800 disabled:text-zinc-600 text-yellow-950 font-black py-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <span>Inscribirme gratis</span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#13141c] border border-zinc-800 rounded-2xl p-6 space-y-6 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 pb-3">
            Resumen del Pedido
          </h3>
          <div className="flex gap-4">
            <div className="h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={course.titulo} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{course.titulo}</h4>
            </div>
          </div>
          <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800/80 pt-4">
            <div className="flex justify-between">
              <span>Precio de lista:</span>
              <span className="line-through text-zinc-500">${course.precio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-white text-sm border-t border-zinc-900 pt-3">
              <span>Tu precio (Pro Max):</span>
              <span className="text-yellow-400">Gratis</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
      
      {/* SUCCESS BLOCKER OVERLAY */}
      {success && (
        <div className="absolute inset-0 bg-[#0b0c10]/95 flex flex-col items-center justify-center text-center p-8 z-50 rounded-2xl border border-zinc-800">
          <div className="h-20 w-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-bounce">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">¡Pago Procesado con Éxito!</h2>
          <p className="text-zinc-400 text-sm max-w-md mt-2 leading-relaxed">
            Tu inscripción al curso de <strong className="text-zinc-100">{course.titulo}</strong> ha sido verificada.
          </p>
          <div className="flex items-center gap-2 mt-6 text-xs text-purple-400 font-bold bg-purple-950/20 border border-purple-800/40 px-3 py-1.5 rounded-full">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Abriendo Aula Virtual...</span>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: Payment details forms */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Method selection tabs */}
        <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-1 rounded-xl border border-zinc-900">
          <button
            type="button"
            onClick={() => setActiveTab("card")}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === "card"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Tarjeta Crédito/Débito
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("paypal")}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === "paypal"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
            }`}
          >
            <span className="font-extrabold italic text-sm tracking-tight text-cyan-400 hover:text-cyan-300">PayPal</span>
            Mock PayPal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("transfer")}
            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === "transfer"
                ? "bg-zinc-800 text-white border border-zinc-700 shadow"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
            }`}
          >
            <span className="text-xs uppercase font-extrabold">Landmark</span>
            Transferencia
          </button>
        </div>

        {/* Dynamic panels */}
        <form onSubmit={handleSubmit} className="bg-[#13141c] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
          
          {errorMsg && (
            <div className="bg-rose-950/30 border border-rose-800/40 text-rose-400 p-4 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {activeTab === "card" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
                  Detalles de la Tarjeta
                </h3>
                <div className="flex gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${detectCardType() === "Visa" ? "bg-blue-950 text-blue-300 border-blue-800/40" : "bg-zinc-900 text-zinc-600 border-zinc-800"}`}>Visa</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${detectCardType() === "Mastercard" ? "bg-amber-950 text-amber-300 border-amber-800/40" : "bg-zinc-900 text-zinc-600 border-zinc-800"}`}>Mastercard</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="cardName" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Nombre en la tarjeta</label>
                  <input
                    type="text"
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="SANTIAGO HERNANDEZ"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="cardNumber" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Número de tarjeta</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 font-mono"
                    />
                    <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="cardExpiry" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">Vencimiento</label>
                    <input
                      type="text"
                      id="cardExpiry"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="cardCvv" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">CVV / CVC</label>
                    <input
                      type="password"
                      id="cardCvv"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 4))}
                      placeholder="•••"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "paypal" && (
            <div className="space-y-4 text-center py-6">
              <div className="h-12 w-12 rounded-full bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center mx-auto">
                <span className="font-extrabold italic text-cyan-400">PP</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Pago seguro mediante PayPal</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Al presionar el botón de pago, abrirás una ventana emergente simulada de PayPal asociada a tu correo <strong className="text-zinc-300">{userEmail}</strong>.
                </p>
              </div>
              <p className="text-[10px] text-zinc-600">Simulación integrada sin cargos reales.</p>
            </div>
          )}

          {activeTab === "transfer" && (
            <div className="space-y-4 text-xs text-zinc-300">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
                Instrucciones de Transferencia
              </h3>
              <p className="leading-relaxed">
                Puedes depositar directamente a la cuenta institucional de U-Forward. Tu inscripción se liberará automáticamente al subir el comprobante.
              </p>
              <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 space-y-2 font-mono text-[10px]">
                <p><span className="text-zinc-600">Banco:</span> BANCO CENTRAL DE COSTA RICA</p>
                <p><span className="text-zinc-600">Cuenta IBAN:</span> CR12015100010020030040</p>
                <p><span className="text-zinc-600">Beneficiario:</span> U-FORWARD ACADEMY SRL</p>
                <p><span className="text-zinc-600">Detalle:</span> COMPRA CURSO {course.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <p className="text-[10px] text-zinc-500 italic">
                * Nota: Para esta simulación, presionar el botón de abajo aprobará el depósito al instante.
              </p>
            </div>
          )}

          {/* Checkout Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-4 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                  <span>{loadingStep}</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-purple-300" />
                  <span>Completar Pago Seguro (${finalPrice.toFixed(2)})</span>
                </>
              )}
            </button>
            <div className="flex justify-center items-center gap-1.5 text-[10px] text-zinc-500 mt-3">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>Transacción encriptada con tecnología SSL de 256 bits</span>
            </div>
          </div>

        </form>

      </div>

      {/* RIGHT COLUMN: Order Summary card */}
      <div className="bg-[#13141c] border border-zinc-800 rounded-2xl p-6 space-y-6 lg:sticky lg:top-24">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400 border-b border-zinc-800/80 pb-3">
          Resumen del Pedido
        </h3>

        {/* Course Card Preview */}
        <div className="flex gap-4">
          <div className="h-16 w-24 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={course.titulo}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
              {course.titulo}
            </h4>
            <p className="text-[10px] text-zinc-500 line-clamp-1">
              Instructor: Santiago Hernández
            </p>
          </div>
        </div>

        {/* Pricing calculations */}
        <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800/80 pt-4">
          {descuentoPorcentaje > 0 ? (
            <>
              <div className="flex justify-between">
                <span>Precio de lista:</span>
                <span className="line-through text-zinc-500">${course.precio.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Descuento membresía ({descuentoPorcentaje}%):</span>
                <span>-${(course.precio - finalPrice).toFixed(2)}</span>
              </div>
            </>
          ) : null}
          <div className="flex justify-between font-bold text-white text-sm border-t border-zinc-900 pt-3">
            <span>Precio total:</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Guarantee details */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-900 text-[10px] text-zinc-500 leading-relaxed space-y-1">
          <p className="font-bold text-zinc-400">Información del estudiante:</p>
          <p className="truncate"><span className="text-zinc-600">Email:</span> {userEmail}</p>
          <p className="text-[9px] text-zinc-600 italic">
            El curso se activará de forma permanente y se asociará a este correo una vez completado el pago.
          </p>
        </div>
      </div>

    </div>
  );
}
