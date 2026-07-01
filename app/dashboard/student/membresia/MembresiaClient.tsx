"use client";

import { useState } from "react";
import {
  Crown,
  Zap,
  Star,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

interface Membership {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string;
  descuentoPorcentaje: number;
  beneficios: string[];
}

interface ActiveSub {
  membershipId: string;
  fechaFin: string;
  Membership: { nombre: string; tipo: string };
}

interface MembresiaClientProps {
  memberships: Membership[];
  activeSub: ActiveSub | null;
  justSubscribed?: boolean;
  canceled?: boolean;
}

const TIER_CONFIG: Record<string, {
  gradient: string;
  border: string;
  badge: string;
  badgeText: string;
  icon: React.ComponentType<{ className?: string }>;
  glow: string;
  highlight: boolean;
}> = {
  DESCUENTO: {
    gradient: "from-zinc-800 to-zinc-900",
    border: "border-zinc-700",
    badge: "bg-zinc-700 text-zinc-300",
    badgeText: "Básico",
    icon: Star,
    glow: "",
    highlight: false,
  },
  ESTANDAR: {
    gradient: "from-indigo-900/60 to-violet-900/60",
    border: "border-indigo-600/50",
    badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    badgeText: "Popular",
    icon: Zap,
    glow: "shadow-indigo-900/30",
    highlight: true,
  },
  PRO_MAX: {
    gradient: "from-amber-900/70 to-yellow-900/60",
    border: "border-yellow-500/40",
    badge: "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30",
    badgeText: "Pro Max",
    icon: Crown,
    glow: "shadow-yellow-900/30",
    highlight: false,
  },
};

export default function MembresiaClient({ memberships, activeSub, justSubscribed, canceled }: MembresiaClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handlePurchase = async (membershipId: string) => {
    setLoading(membershipId);
    setError(null);
    setConfirmId(null);

    try {
      const res = await fetch("/api/membership/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Error al procesar");

      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 px-4 py-1.5 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-yellow-400">Membresías VIP</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Elige tu plan VIP</h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Desbloquea beneficios exclusivos, accede a cursos con descuento o inclúyelos todos en tu membresía Pro Max.
        </p>
      </div>

      {/* Post-checkout banners */}
      {justSubscribed && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/40 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">
            ¡Pago confirmado! Tu membresía se está activando — puede tardar unos segundos en reflejarse.
          </p>
        </div>
      )}
      {canceled && (
        <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 flex items-center gap-3">
          <X className="h-4 w-4 text-zinc-400 shrink-0" />
          <p className="text-sm text-zinc-400">Pago cancelado. Puedes intentarlo de nuevo cuando quieras.</p>
        </div>
      )}

      {/* Active plan banner */}
      {activeSub && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/40 p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Plan activo: <span className="text-white">{activeSub.Membership?.nombre}</span>
            </p>
            <p className="text-xs text-zinc-500">
              Válido hasta: {new Date(activeSub.fechaFin).toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-xl bg-rose-950/40 border border-rose-800/40 p-4 flex items-center gap-3">
          <X className="h-4 w-4 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {memberships.map((m) => {
          const cfg = TIER_CONFIG[m.tipo] ?? TIER_CONFIG.DESCUENTO;
          const Icon = cfg.icon;
          const isCurrent = activeSub?.membershipId === m.id;
          const isConfirming = confirmId === m.id;

          return (
            <div
              key={m.id}
              className={`relative rounded-2xl border bg-gradient-to-b ${cfg.gradient} ${cfg.border} p-6 flex flex-col gap-5 shadow-xl ${cfg.glow} ${cfg.highlight ? "ring-1 ring-indigo-500/30" : ""}`}
            >
              {/* Popular badge */}
              {cfg.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${cfg.badge}`}>
                    ⭐ Más Popular
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.badgeText}
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                      Tu plan
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-white">{m.nombre}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{m.descripcion}</p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-white">${m.precio}</span>
                  <span className="text-zinc-400 text-sm mb-1">/mes</span>
                </div>
                {m.tipo === "PRO_MAX" && (
                  <p className="text-[10px] text-yellow-400/80 mt-1">
                    ✓ Incluye todos los cursos sin costo adicional
                  </p>
                )}
                {m.tipo !== "PRO_MAX" && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {m.descuentoPorcentaje}% de descuento en cursos
                  </p>
                )}
              </div>

              {/* Benefits */}
              <ul className="space-y-2 flex-1">
                {m.beneficios.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl border border-emerald-700/40 bg-emerald-950/30 text-emerald-400 text-xs font-bold py-3 flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Plan Activo
                  </button>
                ) : isConfirming ? (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400 text-center">¿Confirmar suscripción a {m.nombre} por ${m.precio}/mes?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="flex-1 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-bold py-2"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handlePurchase(m.id)}
                        disabled={loading === m.id}
                        className="flex-1 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-yellow-950 text-xs font-extrabold py-2 flex items-center justify-center gap-1 transition-all"
                      >
                        {loading === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirmar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(m.id)}
                    className={`w-full rounded-xl text-xs font-extrabold py-3 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 ${
                      m.tipo === "PRO_MAX"
                        ? "bg-yellow-400 hover:bg-yellow-300 text-yellow-950 shadow-lg shadow-yellow-900/30"
                        : m.tipo === "ESTANDAR"
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-zinc-700 hover:bg-zinc-600 text-white"
                    }`}
                  >
                    {m.tipo === "PRO_MAX" && <Crown className="h-4 w-4" />}
                    {activeSub ? "Cambiar a este plan" : "Suscribirme"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Al suscribirte serás redirigido a Stripe para pagar de forma segura. Las membresías se renuevan automáticamente cada 30 días.
          <br />
          Los cursos gratuitos con Pro Max generan la misma comisión normal para el instructor al momento de la inscripción.
        </p>
      </div>
    </div>
  );
}
