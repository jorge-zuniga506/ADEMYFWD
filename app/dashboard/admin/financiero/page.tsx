import { createClient } from "@/lib/supabase/server";
import { DollarSign, TrendingUp, Users, CreditCard, ShieldCheck } from "lucide-react";
import PayoutList from "@/components/PayoutList";

export default async function FinancieroPage() {
  const supabase = await createClient();

  const { count: totalCursos } = await supabase
    .from("Course")
    .select("*", { count: "exact", head: true })
    .eq("estado", "PUBLICADO");

  const { count: totalUsuarios } = await supabase
    .from("User")
    .select("*", { count: "exact", head: true });

  const { count: totalEnrollments } = await supabase
    .from("Enrollment")
    .select("*", { count: "exact", head: true });

  const { data: txs } = await supabase
    .from("Transaction")
    .select("cantidad");

  const totalVentasPlataforma = txs?.reduce((sum, t) => sum + t.cantidad, 0) ?? 0;
  const comisionPlataforma = totalVentasPlataforma * 0.30; // 30% platform cut

  const { data: payouts } = await supabase
    .from("PayoutRequest")
    .select(`
      id,
      cantidad,
      metodo,
      cuenta,
      estado,
      fechaSolicitud,
      User (
        nombre,
        email
      )
    `)
    .order("fechaSolicitud", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Centro Financiero</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
          Métricas globales de ventas, comisiones de plataforma y retiros de instructores.
        </p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            ${totalVentasPlataforma.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500 font-medium">Ventas Totales</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            ${comisionPlataforma.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500 font-medium">Comisión Plataforma (30%)</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {totalCursos ?? 0}
          </p>
          <p className="text-xs text-zinc-500 font-medium">Cursos Publicados</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            {totalUsuarios ?? 0}
          </p>
          <p className="text-xs text-zinc-500 font-medium">Usuarios Registrados</p>
        </div>
      </div>

      {/* Retiros */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Solicitudes de Retiro de Instructores</h3>
        <PayoutList initialPayouts={payouts as any ?? []} />
      </div>
    </div>
  );
}
