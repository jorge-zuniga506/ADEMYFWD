"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Crown,
  Star,
  FileImage,
  BadgeCheck,
  Info,
  ChevronRight,
} from "lucide-react";

interface VerificationResult {
  aprobado: boolean;
  puntuacion: number;
  analisis: {
    nombreTitular?: string;
    cedula?: string;
    tomo?: string;
    folio?: string;
    asiento?: string;
    horasCronologicas?: string;
    fechaEmision?: string;
    criterios?: Record<string, number>;
  };
  observaciones: string;
}

interface PrevVerification {
  estado: string;
  puntuacion: number;
  comentario: string;
  revisadoEn: string;
  analisisIA: Record<string, unknown>;
}

interface VipFwdClientProps {
  isVerified: boolean;
  prevVerification: PrevVerification | null;
}

const CRITERIA_LABELS: Record<string, string> = {
  logotipos: "Logotipos FWD y Fundación",
  fundacionEmisora: "Fundación CRC Endurance (ONG)",
  programa: "Programa: FULL-STACK",
  duracion: "Duración coherente (horas)",
  datosTitular: "Datos del titular",
  ubicacion: "Ubicación geográfica",
  firma: "Firma autorizada",
  folioTomo: "Tomo / Folio / Asiento",
  estiloVisual: "Estilo visual FWD",
};

export default function VipFwdClient({ isVerified, prevVerification }: VipFwdClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError("El archivo no puede superar los 10 MB.");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("certificate", file);

      const res = await fetch("/api/instructor/verify-certificate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al verificar");

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Zona VIP + FWD</h1>
          {isVerified && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-900/40 border border-emerald-700/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              <BadgeCheck className="h-3 w-3" />
              Verificado FWD
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-400">
          Verifica tu certificado de Graduado FWD Costa Rica para obtener el badge verificado y prioridad en el catálogo de cursos.
        </p>
      </div>

      {/* Already verified status */}
      {isVerified && (
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-700/40 p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">¡Instructor Verificado FWD!</h3>
            <p className="text-sm text-zinc-400">
              Tu certificado ha sido validado. Tus cursos aparecen primero en el catálogo y tienes el badge de verificación visible para los estudiantes.
            </p>
          </div>
        </div>
      )}

      {/* Benefits of verification */}
      <div className="rounded-2xl bg-[#13141c] border border-zinc-800 p-6 space-y-4">
        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">¿Por qué verificarte?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Star, text: "Tus cursos aparecen primero en el catálogo" },
            { icon: BadgeCheck, text: "Badge 'Graduado FWD' visible en tu perfil" },
            { icon: Crown, text: "Acceso a membresía VIP de instructor" },
            { icon: ShieldCheck, text: "Mayor confianza de los estudiantes" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-xl bg-zinc-900/50 border border-zinc-800 p-3">
              <Icon className="h-4 w-4 text-yellow-400 shrink-0" />
              <p className="text-xs text-zinc-300">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload section */}
      <div className="rounded-2xl bg-[#13141c] border border-zinc-800 p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Sube tu Certificado FWD</h3>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Info className="h-3 w-3" />
            Certificado emitido por la Fundación CRC Endurance. JPG, PNG o WebP — máx 10 MB
          </p>
        </div>

        {/* Drop zone */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {!file ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-zinc-700 hover:border-yellow-500/50 bg-zinc-900/30 hover:bg-yellow-950/10 p-10 flex flex-col items-center gap-3 transition-all group"
          >
            <div className="h-12 w-12 rounded-xl bg-zinc-800 group-hover:bg-yellow-900/30 flex items-center justify-center transition-colors">
              <FileImage className="h-6 w-6 text-zinc-500 group-hover:text-yellow-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-300">Haz clic para seleccionar</p>
              <p className="text-xs text-zinc-600 mt-0.5">o arrastra tu certificado aquí</p>
            </div>
          </button>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
              {preview ? (
                <div className="relative h-64">
                  <Image src={preview} alt="Vista previa del certificado" fill className="object-contain p-2" unoptimized />
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center gap-2 text-zinc-400">
                  <FileImage className="h-5 w-5" />
                  <span className="text-sm">{file.name}</span>
                </div>
              )}
              <button
                onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-rose-600 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Verify button */}
            {!result && (
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-yellow-950 font-extrabold text-sm py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-900/30 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verificar Certificado con IA
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-rose-950/40 border border-rose-800/40 p-4 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className={`rounded-2xl border p-6 space-y-6 ${
          result.aprobado
            ? "bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border-emerald-700/40"
            : "bg-gradient-to-br from-amber-900/20 to-orange-900/10 border-amber-700/30"
        }`}>
          {/* Result header */}
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${
              result.aprobado ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-amber-500/20 border border-amber-500/30"
            }`}>
              {result.aprobado
                ? <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                : <AlertCircle className="h-7 w-7 text-amber-400" />
              }
            </div>
            <div>
              <h3 className={`text-lg font-extrabold ${result.aprobado ? "text-emerald-300" : "text-amber-300"}`}>
                {result.aprobado ? "¡Certificado Verificado!" : "Verificación Incompleta"}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">{result.observaciones}</p>
            </div>
          </div>

          {/* Score bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-medium">Puntuación total</span>
              <span className={`text-2xl font-black ${getScoreColor(result.puntuacion)}`}>
                {result.puntuacion}/100
              </span>
            </div>
            <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getScoreBg(result.puntuacion)}`}
                style={{ width: `${result.puntuacion}%` }}
              />
            </div>
            <p className="text-[10px] text-zinc-500">
              {result.aprobado ? "✅ Puntuación suficiente (≥80) para obtener verificación" : "⚠️ Se necesita puntuación ≥80 para aprobar. Asegúrate de que el certificado sea legible y esté completo."}
            </p>
          </div>

          {/* Criteria breakdown */}
          {result.analisis?.criterios && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Desglose por criterio</h4>
              <div className="grid gap-2">
                {Object.entries(result.analisis.criterios).map(([key, pts]) => (
                  <div key={key} className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-3 py-2">
                    <span className="text-xs text-zinc-300">{CRITERIA_LABELS[key] ?? key}</span>
                    <span className={`text-xs font-bold ${(pts as number) > 0 ? "text-emerald-400" : "text-zinc-600"}`}>
                      {pts as number} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted data */}
          {result.analisis?.nombreTitular && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Datos extraídos</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Nombre", val: result.analisis.nombreTitular },
                  { label: "Cédula", val: result.analisis.cedula },
                  { label: "Tomo", val: result.analisis.tomo },
                  { label: "Folio", val: result.analisis.folio },
                  { label: "Asiento", val: result.analisis.asiento },
                  { label: "Horas", val: result.analisis.horasCronologicas },
                  { label: "Fecha emisión", val: result.analisis.fechaEmision },
                ].filter(({ val }) => val).map(({ label, val }) => (
                  <div key={label} className="bg-zinc-900/50 rounded-lg px-3 py-2">
                    <p className="text-zinc-500">{label}</p>
                    <p className="text-white font-medium">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Try again if not approved */}
          {!result.aprobado && (
            <button
              onClick={() => { setFile(null); setPreview(null); setResult(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="w-full rounded-xl border border-zinc-700 text-zinc-300 text-xs font-bold py-3 hover:bg-zinc-800 transition-all"
            >
              Intentar con otra imagen
            </button>
          )}
        </div>
      )}

      {/* Previous verification */}
      {prevVerification && !result && (
        <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-5 space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Último intento de verificación</h4>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              prevVerification.estado === "APROBADO"
                ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800/40"
                : prevVerification.estado === "RECHAZADO"
                ? "bg-rose-900/40 text-rose-400 border border-rose-800/40"
                : "bg-amber-900/40 text-amber-400 border border-amber-800/40"
            }`}>
              {prevVerification.estado}
            </span>
            <span className="text-xs text-zinc-500">
              Puntuación: {prevVerification.puntuacion}/100 · {new Date(prevVerification.revisadoEn).toLocaleDateString("es-CR")}
            </span>
          </div>
          {prevVerification.comentario && (
            <p className="text-xs text-zinc-400">{prevVerification.comentario}</p>
          )}
        </div>
      )}
    </div>
  );
}
