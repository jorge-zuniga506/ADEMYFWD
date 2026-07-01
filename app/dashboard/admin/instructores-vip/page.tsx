import { createClient } from "@/lib/supabase/server";
import {
  approveInstructorVerification,
  rejectInstructorVerification,
} from "@/lib/actions/admin";
import { Badge, Button } from "@/components/ui";
import { Crown, Check, X } from "lucide-react";

export default async function InstructoresVipPage() {
  const supabase = await createClient();

  const { data: solicitudes } = await supabase
    .from("InstructorVerification")
    .select("id, estado, puntuacion, comentario, certificadoUrl, createdAt, userId, User!inner(nombre, email)")
    .order("createdAt", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Instructores VIP+FWD</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Revisa las solicitudes de verificación de certificado que la IA no aprobó automáticamente (puntuación &lt; 80).
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
                      sol.estado === "APROBADO"
                        ? "success"
                        : sol.estado === "RECHAZADO"
                          ? "warning"
                          : "default"
                    }
                  >
                    {sol.estado}
                  </Badge>
                </div>

                <div className="mb-3 flex items-center gap-4 text-xs text-zinc-400">
                  <span>Puntuación IA: {sol.puntuacion ?? 0}/100</span>
                  <span>Solicitado: {sol.createdAt ? new Date(sol.createdAt).toLocaleDateString() : "—"}</span>
                  {sol.certificadoUrl && (
                    <a
                      href={sol.certificadoUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700"
                    >
                      Ver certificado
                    </a>
                  )}
                </div>

                {sol.comentario && (
                  <div className="mb-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {sol.comentario}
                  </div>
                )}

                {sol.estado === "PENDIENTE" && (
                  <div className="flex gap-2">
                    <form
                      action={approveInstructorVerification.bind(null, sol.id, sol.userId)}
                    >
                      <Button type="submit" variant="primary" size="sm">
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                    </form>

                    <RejectForm verificationId={sol.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <Crown className="mx-auto mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No hay solicitudes de verificación VIP+FWD pendientes.
          </p>
        </div>
      )}
    </div>
  );
}

function RejectForm({ verificationId }: { verificationId: string }) {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const notas = formData.get("notas") as string;
        await rejectInstructorVerification(verificationId, notas);
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
