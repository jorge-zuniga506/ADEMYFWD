import { createClient } from "@/lib/supabase/server";
import { DollarSign, TrendingUp, Users, ShieldCheck, Mail, Cpu } from "lucide-react";
import PayoutList from "@/components/PayoutList";

// Forzar renderizado dinámico para que los datos se lean en tiempo real en producción
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FinancieroPage() {
  const supabase = await createClient();

  const { count: totalCursos } = await supabase
    .from("Course")
    .select("*", { count: "exact", head: true })
    .eq("estado", "PUBLICADO");

  const { count: totalUsuarios } = await supabase
    .from("User")
    .select("*", { count: "exact", head: true });

  // Calcular límite de correos diarios de Gmail (límite 500)
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);

  const { count: correosEnviadosHoy } = await (supabase as any)
    .from("EmailLog")
    .select("*", { count: "exact", head: true })
    .gte("fecha", inicioHoy.toISOString());

  const totalEmailsHoy = correosEnviadosHoy ?? 0;
  const limiteEmails = 500;
  const porcentajeEmails = Math.min((totalEmailsHoy / limiteEmails) * 100, 100);

  // Calcular consumo de IA diario
  const { count: peticionesIaHoy } = await (supabase as any)
    .from("AiLog")
    .select("*", { count: "exact", head: true })
    .gte("fecha", inicioHoy.toISOString());

  const { data: logsIaHoy } = await (supabase as any)
    .from("AiLog")
    .select("proveedor")
    .gte("fecha", inicioHoy.toISOString());

  const totalIaHoy = peticionesIaHoy ?? 0;
  const geminiPeticiones = logsIaHoy?.filter((l: any) => l.proveedor === "GEMINI").length ?? 0;
  const kimiPeticiones = logsIaHoy?.filter((l: any) => l.proveedor === "KIMI").length ?? 0;
  const openrouterPeticiones = logsIaHoy?.filter((l: any) => l.proveedor === "OPENROUTER").length ?? 0;

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
          Métricas globales de ventas, comisiones de plataforma, retiros de instructores y uso de servicios.
        </p>
      </div>

      {/* Grid de Métricas Financieras Principales */}
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

      {/* Monitoreo de Infraestructura y Servicios */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Monitoreo de Infraestructura y Servicios</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Tarjeta de Límite de Correos del Sistema */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-50/20 px-2 py-1 rounded-lg">SMTP Gmail</span>
              </div>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Límite Diario de Envíos</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                  {totalEmailsHoy}
                </p>
                <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">/ {limiteEmails} correos</span>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500" 
                  style={{ width: `${porcentajeEmails}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-zinc-500 font-medium">
                <span>{porcentajeEmails.toFixed(1)}% consumido</span>
                <span>Restantes: {limiteEmails - totalEmailsHoy}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Consumo de IA de la Plataforma */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-purple-500 bg-purple-50/20 px-2 py-1 rounded-lg">LLMs Activos</span>
              </div>
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Peticiones de IA de Hoy</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">
                  {totalIaHoy}
                </p>
                <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-500">peticiones</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Distribución por proveedores */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                  <span>Gemini (Google)</span>
                  <span className="text-zinc-300 font-bold">{geminiPeticiones} peticiones</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${totalIaHoy ? (geminiPeticiones / totalIaHoy) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                  <span>Kimi (Moonshot)</span>
                  <span className="text-zinc-300 font-bold">{kimiPeticiones} peticiones</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500" style={{ width: `${totalIaHoy ? (kimiPeticiones / totalIaHoy) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400 font-medium">
                  <span>OpenRouter (GPTs)</span>
                  <span className="text-zinc-300 font-bold">{openrouterPeticiones} peticiones</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500" style={{ width: `${totalIaHoy ? (openrouterPeticiones / totalIaHoy) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
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
