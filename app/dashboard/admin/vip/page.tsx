import { createClient } from "@/lib/supabase/server";
import { approveJobPost, rejectJobPost } from "@/lib/actions/admin";
import { Badge, Button } from "@/components/ui";
import { Crown, Check, X, Briefcase } from "lucide-react";

export default async function VipPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("FwdJobPost")
    .select("id, empresa, tituloPuesto, descripcion, salario, fechaCreacion, estado")
    .order("fechaCreacion", { ascending: false });

  const { data: snippets } = await supabase
    .from("FwdCodeSnippet")
    .select("id, titulo, userId, fechaCreacion, User!inner(nombre)");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Ecosistema VIP
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Moderacion de vacantes y codigos
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">
          Vacantes ({posts?.length ?? 0})
        </h2>

        {posts && posts.length > 0 ? (
          <div className="grid gap-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{post.tituloPuesto}</h3>
                    <p className="text-sm text-zinc-500">
                      {post.empresa}
                      {post.salario ? ` | ${post.salario}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      post.estado === "APROBADA"
                        ? "success"
                        : post.estado === "RECHAZADA"
                          ? "warning"
                          : "default"
                    }
                  >
                    {post.estado ?? "PENDIENTE"}
                  </Badge>
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {post.descripcion}
                </p>

                {(!post.estado || post.estado === "PENDIENTE") && (
                  <div className="flex gap-2">
                    <form action={approveJobPost.bind(null, post.id)}>
                      <Button type="submit" size="sm">
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                    </form>
                    <form action={rejectJobPost.bind(null, post.id)}>
                      <Button type="submit" variant="outline" size="sm">
                        <X className="h-4 w-4" />
                        Rechazar
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center dark:border-zinc-700">
            <Briefcase className="mx-auto mb-2 h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">No hay vacantes.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Fragmentos de Codigo ({snippets?.length ?? 0})
        </h2>

        {snippets && snippets.length > 0 ? (
          <div className="grid gap-3">
            {snippets.map((snippet) => {
              const user = snippet.User as unknown as { nombre: string };
              return (
                <div
                  key={snippet.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{snippet.titulo}</h3>
                      <p className="text-sm text-zinc-500">
                        Por {user.nombre} &middot;{" "}
                        {new Date(snippet.fechaCreacion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 py-8 text-center dark:border-zinc-700">
            <Crown className="mx-auto mb-2 h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">
              No hay fragmentos de codigo.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
