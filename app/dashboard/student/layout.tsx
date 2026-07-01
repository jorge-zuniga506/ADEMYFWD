import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("User")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "ESTUDIANTE" && perfil?.rol !== "GRADUADO_FWD" && perfil?.rol !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
