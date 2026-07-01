import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui";
import { User } from "lucide-react";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("User")
    .select("nombre, email, rol, fechaRegistro, bio, redesSociales")
    .eq("id", user!.id)
    .single();

  const redes = perfil?.redesSociales as Record<string, string> | null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Edita tu informacion personal
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/50">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{perfil?.nombre}</h2>
            <p className="text-sm text-zinc-500">{perfil?.email}</p>
          </div>
        </div>

        <form action={updateProfile} className="grid gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Biografia
            </label>
            <textarea
              name="bio"
              defaultValue={perfil?.bio ?? ""}
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Redes sociales (formato: clave: valor, una por linea)
            </label>
            <textarea
              name="redesSociales"
              defaultValue={
                redes
                  ? Object.entries(redes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join("\n")
                  : ""
              }
              rows={3}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-zinc-700"
              placeholder="github: https://github.com/tuusuario&#10;linkedin: https://linkedin.com/in/tuusuario"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email (no editable)
            </label>
            <input
              value={perfil?.email}
              disabled
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button type="submit">Guardar cambios</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
