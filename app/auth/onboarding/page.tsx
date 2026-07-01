"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo, { LogoIcon } from "@/components/Logo";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
type Step = "nombre" | "rol" | "proposito" | "como" | "listo";

const ROLES = [
  {
    value: "ESTUDIANTE",
    label: "Estudiante",
    desc: "Quiero aprender y crecer profesionalmente.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5 12.083 12.083 0 015.84 10.578L12 14z" />
      </svg>
    ),
  },
  {
    value: "INSTRUCTOR",
    label: "Instructor",
    desc: "Quiero crear y compartir cursos con la comunidad.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const PROPOSITOS = [
  { value: "aprender", label: "Aprender algo nuevo" },
  { value: "trabajo", label: "Mejorar en mi trabajo" },
  { value: "proyecto", label: "Iniciar un proyecto propio" },
  { value: "certificacion", label: "Obtener certificaciones" },
];

const COMO_NOS_CONOCIO = [
  { value: "redes_sociales", label: "Redes sociales" },
  { value: "amigo", label: "Me lo recomendó un amigo" },
  { value: "fwd_comunidad", label: "Comunidad FWD" },
  { value: "google", label: "Búsqueda en Google" },
  { value: "otro", label: "Otro" },
];

// ─── Step Indicator ─────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i < current
              ? "w-6 bg-purple-500"
              : i === current
              ? "w-8 bg-gradient-to-r from-purple-500 to-cyan-500"
              : "w-4 bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Main Onboarding Page ────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("nombre");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  // Form state
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState<string>("ESTUDIANTE");
  const [proposito, setProposito] = useState<string>("");
  const [comoNosConocio, setComoNosConocio] = useState<string>("");

  const steps: Step[] = ["nombre", "rol", "proposito", "como", "listo"];
  const stepIndex = steps.indexOf(step);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? "");
      // Pre-fill nombre from Google metadata
      const displayName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? "";
      if (displayName) setNombre(displayName);

      // Check if already onboarded
      const { data: perfil } = await supabase
        .from("User")
        .select("onboardingDone")
        .eq("id", user.id)
        .single();
      if (perfil?.onboardingDone) router.push("/dashboard");
    };
    init();
  }, [router]);

  async function handleFinish() {
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from("User").upsert({
      id: userId,
      nombre,
      email: userEmail,
      passwordHash: "",
      rol: rol as "ESTUDIANTE" | "INSTRUCTOR",
      onboardingDone: true,
      propositoUso: proposito || null,
      comoNosConocio: comoNosConocio || null,
    });

    setSaving(false);

    if (error) {
      console.error("Error saving profile:", error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  // ── Render Steps ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,_rgba(168,85,247,0.12),_transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,182,212,0.08),_transparent_55%)]" />

      {/* Logo fixed top */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2">
        <Logo className="h-8 w-8" />
      </div>

      <div className="w-full max-w-md mt-16">
        {/* Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm p-8 shadow-2xl shadow-black/60 ring-1 ring-white/5">

          {/* Logo icon top center */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 blur-xl" />
              <LogoIcon className="h-16 w-16 relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
            </div>
          </div>

          {/* ── STEP 1: Nombre ── */}
          {step === "nombre" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  ¿Cómo te llamaremos?
                </h1>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Este será tu nombre en la plataforma.
                </p>
              </div>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre o apodo"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-white placeholder-zinc-600 text-lg focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                autoFocus
              />
              <button
                onClick={() => nombre.trim() && setStep("rol")}
                disabled={!nombre.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3 text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
              >
                Próximo →
              </button>
            </div>
          )}

          {/* ── STEP 2: Rol ── */}
          {step === "rol" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  ¿Qué eres en FWD?
                </h1>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Escoge el rol que mejor te describe.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRol(r.value)}
                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border text-left transition-all duration-200 ${
                      rol === r.value
                        ? "border-purple-500/70 bg-purple-500/10 ring-1 ring-purple-500/40"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div className={rol === r.value ? "text-purple-400" : "text-zinc-500"}>
                      {r.icon}
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white text-sm">{r.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{r.desc}</p>
                    </div>
                    {rol === r.value && (
                      <div className="absolute top-3 right-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("nombre")} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 font-semibold py-3 text-sm hover:bg-zinc-900 transition-all">
                  ← Atrás
                </button>
                <button
                  onClick={() => setStep("proposito")}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3 text-sm tracking-wide transition-all duration-200 shadow-lg shadow-purple-900/30"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Propósito ── */}
          {step === "proposito" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  ¿Para qué usarás la plataforma?
                </h1>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Nos ayudas a recomendarte mejor.
                </p>
              </div>
              <div className="space-y-2">
                {PROPOSITOS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setProposito(p.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ${
                      proposito === p.value
                        ? "border-purple-500/70 bg-purple-500/10 ring-1 ring-purple-500/40"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      proposito === p.value ? "border-purple-500 bg-purple-500" : "border-zinc-600"
                    }`}>
                      {proposito === p.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium text-white">{p.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("rol")} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 font-semibold py-3 text-sm hover:bg-zinc-900 transition-all">
                  ← Atrás
                </button>
                <button
                  onClick={() => proposito && setStep("como")}
                  disabled={!proposito}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold py-3 text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Cómo nos conoció ── */}
          {step === "como" && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  ¿Dónde nos conociste?
                </h1>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Ayúdanos a entender cómo llegas hasta aquí.
                </p>
              </div>
              <div className="space-y-2">
                {COMO_NOS_CONOCIO.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setComoNosConocio(c.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-200 ${
                      comoNosConocio === c.value
                        ? "border-cyan-500/70 bg-cyan-500/10 ring-1 ring-cyan-500/40"
                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      comoNosConocio === c.value ? "border-cyan-500 bg-cyan-500" : "border-zinc-600"
                    }`}>
                      {comoNosConocio === c.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium text-white">{c.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep("proposito")} className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 font-semibold py-3 text-sm hover:bg-zinc-900 transition-all">
                  ← Atrás
                </button>
                <button
                  onClick={() => comoNosConocio && setStep("listo")}
                  disabled={!comoNosConocio}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3 text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30"
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Listo ── */}
          {step === "listo" && (
            <div className="space-y-6 animate-fade-in text-center">
              <div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8 text-purple-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  ¡Todo listo, {nombre.split(" ")[0]}!
                </h1>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  Tu perfil está configurado. Bienvenido a la comunidad{" "}
                  <span className="text-purple-400 font-semibold">Udemy FWD Costa Rica</span>.
                </p>
              </div>

              {/* Summary card */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nombre</span>
                  <span className="text-white font-medium">{nombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rol</span>
                  <span className={`font-medium ${rol === "INSTRUCTOR" ? "text-cyan-400" : "text-purple-400"}`}>
                    {ROLES.find((r) => r.value === rol)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Objetivo</span>
                  <span className="text-white font-medium">{PROPOSITOS.find((p) => p.value === proposito)?.label}</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 hover:opacity-90 text-white font-black py-3.5 text-sm tracking-wider transition-all duration-200 disabled:opacity-50 shadow-lg shadow-purple-900/30"
              >
                {saving ? "Guardando..." : "Entrar a la plataforma →"}
              </button>
            </div>
          )}

          {/* Step dots */}
          {step !== "listo" && (
            <div className="mt-6">
              <StepDots current={stepIndex} total={steps.length - 1} />
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-zinc-700">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-zinc-500 hover:text-zinc-400 transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
