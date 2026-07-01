import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";
import { requestFwdCredential } from "@/lib/actions/student";
import { Button } from "@/components/ui";
import { User, Bell, Lock, DollarSign, ShieldCheck } from "lucide-react";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("User")
    .select("nombre, email, bio, redessociales")
    .eq("id", user!.id)
    .single();

  const { data: purchases } = await supabase
    .from("Transaction")
    .select(`
      id,
      cantidad,
      fecha,
      Course (
        titulo
      )
    `)
    .eq("userId", user!.id)
    .order("fecha", { ascending: false });

  const { data: credential } = await supabase
    .from("FwdCredential")
    .select("id, estado, documentoUrl, notasAdmin, fechaSolicitud")
    .eq("userId", user!.id)
    .maybeSingle();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">Configuración</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-sans">
          Edita tu perfil, solicita verificación de título y revisa tus compras.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Columna Izquierda: Formularios de Perfil y Verificación */}
        <div className="lg:col-span-3 space-y-6">
          {/* Perfil */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <User className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Información Personal</h2>
            </div>

            <form action={updateProfile} className="grid gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Nombre
                </label>
                <input
                  name="nombre"
                  defaultValue={perfil?.nombre}
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Biografía
                </label>
                <textarea
                  name="bio"
                  defaultValue={perfil?.bio ?? ""}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Email (no editable)
                </label>
                <input
                  value={perfil?.email}
                  disabled
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-400 dark:border-zinc-850 dark:bg-zinc-950"
                />
              </div>

              <div>
                <Button type="submit" size="sm">Guardar cambios</Button>
              </div>
            </form>
          </section>

          {/* Centro de Verificación U-Forward */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Centro de Verificación U-Forward</h2>
            </div>

            {credential ? (
              <div className="space-y-3 rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Estado de tu solicitud:</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    credential.estado === "APROBADA"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : credential.estado === "PENDIENTE"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                  }`}>
                    {credential.estado}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  Enlace enviado: <a href={credential.documentoUrl} target="_blank" rel="noreferrer" className="underline text-primary-500">{credential.documentoUrl}</a>
                </p>
                {credential.notasAdmin && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Notas de administración: {credential.notasAdmin}
                  </p>
                )}
                <p className="text-[10px] text-zinc-400">
                  Enviado el: {new Date(credential.fechaSolicitud).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <form action={requestFwdCredential} className="space-y-4">
                <p className="text-xs text-zinc-500">
                  Si eres graduado de U-Forward, puedes subir tu postulación para validar tu título y recibir beneficios exclusivos en tu perfil.
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Enlace a tu título o portafolio U-Forward</label>
                  <input
                    name="documentoUrl"
                    placeholder="https://drive.google.com/file/d/... o enlace similar"
                    required
                    className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
                  />
                </div>
                <Button type="submit" size="sm">
                  Soy graduado de U-Forward: Validar mi título
                </Button>
              </form>
            )}
          </section>
        </div>

        {/* Columna Derecha: Historial de Compras */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 flex flex-col min-h-[300px]">
            <div className="mb-4 flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 font-sans">Historial de Compras</h2>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[450px] pr-1">
              {purchases && purchases.length > 0 ? (
                <div className="space-y-3">
                  {purchases.map((p: { id: string; Course: { titulo: string } | null; fecha: string; cantidad: number }) => (
                    <div key={p.id} className="rounded-xl border border-zinc-100 p-3 dark:border-zinc-800 flex justify-between items-center">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-xs truncate text-zinc-800 dark:text-zinc-200">{p.Course?.titulo}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(p.fecha).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-xs shrink-0 text-zinc-900 dark:text-zinc-50">
                        ${p.cantidad.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <DollarSign className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-xs text-zinc-400">No has realizado ninguna compra de cursos todavía.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
