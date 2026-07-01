"use client";

import { useState } from "react";
import { processPayout } from "@/lib/actions/admin";
import { CreditCard, Check, X, Clock, HelpCircle } from "lucide-react";
import { Button } from "./ui";
import { showAlert } from "@/lib/alert";

interface PayoutRequest {
  id: string;
  cantidad: number;
  metodo: string;
  cuenta: string;
  estado: string;
  fechaSolicitud: string;
  User: {
    nombre: string;
    email: string;
  };
}

export default function PayoutList({ initialPayouts }: { initialPayouts: PayoutRequest[] }) {
  const [payouts, setPayouts] = useState<PayoutRequest[]>(initialPayouts);
  const [actionMsg, setActionMsg] = useState("");

  const handleAction = async (id: string, type: "TRANSFERIDO" | "RECHAZADO") => {
    try {
      await processPayout(id, type);
      setPayouts(prev =>
        prev.map(p => (p.id === id ? { ...p, estado: type } : p))
      );
      setActionMsg("¡Solicitud procesada con éxito!");
      setTimeout(() => setActionMsg(""), 5000);
    } catch (err: any) {
      showAlert({ title: "Error", text: err.message, icon: "error" });
    }
  };

  return (
    <div className="space-y-4">
      {actionMsg && (
        <p className="text-center text-xs font-bold text-emerald-500 bg-emerald-50/20 py-2 rounded-xl border border-emerald-500/20">
          {actionMsg}
        </p>
      )}

      {payouts.length > 0 ? (
        <div className="grid gap-4">
          {payouts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    p.estado === "TRANSFERIDO"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : p.estado === "PENDIENTE"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                  }`}>
                    {p.estado}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Solicitado: {new Date(p.fechaSolicitud).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{p.User?.nombre}</h4>
                  <p className="text-xs text-zinc-400">{p.User?.email}</p>
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900/50">
                  <p className="font-semibold text-[10px] uppercase text-zinc-400 tracking-wider">Método de Cobro ({p.metodo})</p>
                  <p className="font-mono mt-0.5">{p.cuenta}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
                <div className="text-right md:pr-4 flex flex-col justify-center">
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Monto Solicitado</p>
                  <p className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">${p.cantidad.toFixed(2)}</p>
                </div>

                {p.estado === "PENDIENTE" && (
                  <div className="flex gap-2 items-center">
                    {/* Botón de Aprobación */}
                    <button
                      onClick={() => handleAction(p.id, "TRANSFERIDO")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
                    >
                      <Check className="h-4 w-4" />
                      Transferido
                    </button>

                    {/* Botón de rechazo */}
                    <button
                      onClick={() => handleAction(p.id, "RECHAZADO")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 dark:border-red-950/20 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 px-4 py-2.5 text-xs font-bold transition"
                    >
                      <X className="h-4 w-4" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
          <Clock className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">No hay ninguna solicitud de retiro registrada en el sistema.</p>
        </div>
      )}
    </div>
  );
}
