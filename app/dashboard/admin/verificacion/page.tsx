import { createClient } from "@/lib/supabase/server";
import {
  approveFwdCredential,
  rejectFwdCredential,
} from "@/lib/actions/admin";
import { Badge, Button } from "@/components/ui";
import { ShieldCheck, X, Check, ExternalLink } from "lucide-react";

export default async function VerificacionPage() {
  const supabase = await createClient();

  const { data: solicitudes } = await supabase
    .from("FwdCredential")
    .select("id, documentoUrl, estado, notasAdmin, fechaSolicitud, userId, User!inner(nombre, email)")
    .order("fechaSolicitud", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Centro de Verificacion
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Filtro anti-estafas &mdash; Revisa y aprueba credenciales U-Forward
        </p>
      </div>

      {solicitudes && solicitudes.length > 0 ? (
        <div className="grid gap-4">
          {solicitudes.map((sol) => {
            const user = sol.User as unknown as { nombre: string; email: string };
            return (
              <div
                key={sol.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{user.nombre}</h3>
                    <p className="text-sm text-zinc-500">{user.email}</p>
                  </div>
                  <Badge
                    variant={
                      sol.estado === "APROBADA"
                        ? "success"
                        : sol.estado === "RECHAZADA"
                          ? "warning"
                          : "default"
                    }
                  >
                    {sol.estado}
                  </Badge>
                </div>

                <div className="mb-3 flex items-center gap-4 text-xs text-zinc-400">
                  <span>
                    Solicitado:{" "}
                    {new Date(sol.fechaSolicitud).toLocaleDateString()}
                  </span>
                  <a
                    href={sol.documentoUrl}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver documento
                  </a>
                </div>

                {sol.notasAdmin && (
                  <div className="mb-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    Notas: {sol.notasAdmin}
                  </div>
                )}

                {sol.estado === "PENDIENTE" && (
                  <div className="flex gap-2">
                    <form
                      action={approveFwdCredential.bind(null, sol.id, sol.userId)}
                    >
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                      >
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                    </form>

                    <RejectForm credentialId={sol.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No hay solicitudes de verificacion pendientes.
          </p>
        </div>
      )}
    </div>
  );
}

function RejectForm({ credentialId }: { credentialId: string }) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const notas = formData.get("notas") as string;
        await rejectFwdCredential(credentialId, notas);
      }}
      className="flex items-center gap-2"
    >
      <input
        name="notas"
        placeholder="Motivo del rechazo..."
        required
        className="h-8 rounded-lg border border-zinc-300 px-2 text-xs focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
      />
      <Button type="submit" variant="outline" size="sm">
        <X className="h-4 w-4" />
        Rechazar
      </Button>
    </form>
  );
}
