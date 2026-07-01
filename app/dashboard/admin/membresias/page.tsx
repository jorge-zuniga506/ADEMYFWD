import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { Crown, DollarSign, Users, TrendingUp } from "lucide-react";

export default async function MembresiasAdminPage() {
  const supabase = await createClient();

  const { data: subs } = await supabase
    .from("UserMembership")
    .select("id, estado, montoPagado, fechaInicio, fechaFin, userId, User(nombre, email), Membership(nombre, tipo)")
    .order("createdAt", { ascending: false });

  const activas = (subs ?? []).filter((s) => s.estado === "ACTIVA");
  const ingresosTotales = (subs ?? [])
    .filter((s) => s.estado === "ACTIVA" || s.estado === "VENCIDA" || s.estado === "CANCELADA")
    .reduce((sum, s) => sum + (s.montoPagado ?? 0), 0);

  const porTipo = activas.reduce<Record<string, number>>((acc, s) => {
    const tipo = (s.Membership as unknown as { tipo: string } | null)?.tipo ?? "OTRO";
    acc[tipo] = (acc[tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Membresías VIP
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Todas las suscripciones de membresía procesadas por Stripe, con su estado de pago.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">${ingresosTotales.toFixed(2)}</p>
          <p className="text-xs text-zinc-500 font-medium">Ingresos por membresías</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{activas.length}</p>
          <p className="text-xs text-zinc-500 font-medium">Miembros activos</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <Crown className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{porTipo.PRO_MAX ?? 0}</p>
          <p className="text-xs text-zinc-500 font-medium">Pro Max activos</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {(porTipo.DESCUENTO ?? 0) + (porTipo.ESTANDAR ?? 0)}
          </p>
          <p className="text-xs text-zinc-500 font-medium">Descuento + Plus activos</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-5 py-3 font-medium">Usuario</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Monto</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Vence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(subs ?? []).map((s) => {
              const user = s.User as unknown as { nombre: string; email: string } | null;
              const membership = s.Membership as unknown as { nombre: string; tipo: string } | null;
              return (
                <tr key={s.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">{user?.nombre ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">{membership?.nombre ?? "—"}</td>
                  <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                    ${s.montoPagado?.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={
                        s.estado === "ACTIVA"
                          ? "success"
                          : s.estado === "PENDIENTE_PAGO"
                            ? "default"
                            : "warning"
                      }
                    >
                      {s.estado}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-500">
                    {s.fechaFin ? new Date(s.fechaFin).toLocaleDateString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!subs || subs.length === 0) && (
          <div className="py-16 text-center">
            <Crown className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-xs text-zinc-500">Todavía no hay membresías compradas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
