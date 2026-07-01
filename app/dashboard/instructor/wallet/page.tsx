import { createClient } from "@/lib/supabase/server";
import { Wallet, DollarSign, TrendingUp, Clock, Landmark, CreditCard, Send } from "lucide-react";
import { requestPayout } from "@/lib/actions/instructor";
import { Button } from "@/components/ui";

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: cursos } = await supabase
    .from("Course")
    .select("id, precio, titulo")
    .eq("instructorId", user!.id);

  const courseIds = (cursos ?? []).map((c) => c.id);

  const { data: enrollments } = courseIds.length > 0
    ? await supabase
        .from("Enrollment")
        .select("courseId")
        .in("courseId", courseIds)
    : { data: [] };

  const { data: payouts } = await supabase
    .from("PayoutRequest")
    .select("id, cantidad, metodo, cuenta, estado, fechaSolicitud")
    .eq("userId", user!.id)
    .order("fechaSolicitud", { ascending: false });

  const { data: sales } = courseIds.length > 0
    ? await supabase
        .from("Transaction")
        .select(`
          id,
          cantidad,
          fecha,
          courseId,
          Course (
            titulo
          ),
          User (
            nombre
          )
        `)
        .in("courseId", courseIds)
        .order("fecha", { ascending: false })
    : { data: [] };

  const totalEnrollments = enrollments?.length ?? 0;
  const ingresosBrutos = cursos?.reduce((sum, c) => sum + (c.precio ?? 0) * (enrollments ?? []).filter((e) => e.courseId === c.id).length, 0) ?? 0;
  const comision = ingresosBrutos * 0.15;
  const neto = ingresosBrutos - comision;

  const totalRetirado = payouts
    ?.filter((p) => p.estado === "APROBADO")
    .reduce((sum, p) => sum + p.cantidad, 0) ?? 0;

  const saldoDisponible = Math.max(neto - totalRetirado, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Billetera</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Administra tus ingresos acumulados, solicita retiros de saldo y revisa tus transacciones.
        </p>
      </div>

      {/* Grid de Balances */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Saldo Disponible */}
        <div className="relative overflow-hidden rounded-2xl border border-primary-200 bg-primary-50/20 p-6 shadow-sm dark:border-primary-950/30 dark:bg-primary-950/10 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">Saldo Disponible</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-primary-900 dark:text-primary-100">${saldoDisponible.toFixed(2)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500 text-white shadow-sm shadow-primary-500/20">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Ingresos Netos */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Total Ganado (Neto)</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${neto.toFixed(2)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Ingresos Brutos */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Ventas Totales (Bruto)</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${ingresosBrutos.toFixed(2)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Comisión plataforma */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Comisión (15%)</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">${comision.toFixed(2)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Retiros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Solicitar Retiro</h3>
            
            {saldoDisponible > 0 ? (
              <form action={requestPayout} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Monto a retirar ($)</label>
                  <input
                    name="cantidad"
                    type="number"
                    step="0.01"
                    min="1"
                    max={saldoDisponible}
                    defaultValue={saldoDisponible.toFixed(2)}
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Método de pago</label>
                  <select
                    name="metodo"
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                  >
                    <option value="PAYPAL" className="dark:bg-zinc-900">PayPal</option>
                    <option value="BANK_TRANSFER" className="dark:bg-zinc-900">Transferencia Bancaria</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Detalle de cuenta (Email o IBAN)</label>
                  <input
                    name="cuenta"
                    placeholder="email@pago.com o ESXX 0000..."
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                  />
                </div>

                <Button type="submit" size="sm" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Solicitud
                </Button>
              </form>
            ) : (
              <p className="text-xs text-zinc-400 py-6 text-center">
                Necesitas tener un saldo disponible superior a $0.00 para poder solicitar un pago.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Historial de Pagos</h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {payouts && payouts.length > 0 ? (
                payouts.map((p) => {
                  const isPending = p.estado === "PENDIENTE";
                  const isApproved = p.estado === "APROBADO";

                  return (
                    <div key={p.id} className="flex justify-between items-center rounded-xl border border-zinc-100 p-3 dark:border-zinc-800">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {p.metodo === "PAYPAL" ? (
                            <CreditCard className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <Landmark className="h-3.5 w-3.5 text-zinc-500" />
                          )}
                          <span className="font-semibold text-sm">${p.cantidad.toFixed(2)}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">{p.cuenta}</p>
                      </div>
                      <div className="text-right">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : isPending
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}>
                          {p.estado}
                        </span>
                        <p className="text-[9px] text-zinc-400 mt-1">
                          {new Date(p.fechaSolicitud).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-400 py-6 text-center">Aún no has solicitado ningún retiro.</p>
              )}
            </div>
          </div>
        </div>

        {/* Historial de Ventas */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
          <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">Historial de Ventas</h3>
          
          <div className="flex-1 overflow-x-auto">
            {sales && sales.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 dark:border-zinc-800">
                    <th className="py-2.5 font-medium">Estudiante</th>
                    <th className="py-2.5 font-medium">Curso</th>
                    <th className="py-2.5 font-medium">Fecha</th>
                    <th className="py-2.5 font-medium text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {sales.map((s: any) => (
                    <tr key={s.id}>
                      <td className="py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                        {s.User?.nombre ?? "Alumno FWD"}
                      </td>
                      <td className="py-2.5 text-zinc-500 max-w-[140px] truncate">
                        {s.Course?.titulo}
                      </td>
                      <td className="py-2.5 text-zinc-400">
                        {new Date(s.fecha).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 font-semibold text-right text-zinc-950 dark:text-zinc-50">
                        +${s.cantidad.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center">
                <DollarSign className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="text-xs text-zinc-400">
                  No se han registrado ventas de tus cursos en el historial detallado de transacciones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

