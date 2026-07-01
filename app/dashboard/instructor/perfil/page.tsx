import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/actions/profile";
import ProfileForm from "./ProfileForm";
import { redirect } from "next/navigation";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil, error } = await supabase
    .from("User")
    .select("nombre, email, rol, bio, redessociales, avatarUrl")
    .eq("id", user.id)
    .single();

  if (error || !perfil) {
    console.error("Perfil no encontrado para user:", user.id, error);
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
          Perfil
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Edita tu información académica, biografía y enlaces de contacto profesional.
        </p>
      </div>

      <ProfileForm
        perfil={{
          nombre: perfil.nombre,
          email: perfil.email,
          rol: perfil.rol,
          bio: perfil.bio,
          redesSociales: (perfil.redessociales as Record<string, string> | null),
          avatarUrl: perfil.avatarUrl ?? null,
        }}
        updateAction={updateProfile}
      />
    </div>
  );
}
