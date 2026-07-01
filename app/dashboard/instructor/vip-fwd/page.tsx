import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VipFwdClient from "./VipFwdClient";

export default async function VipFwdPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("User")
    .select("rol, isVerified")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "INSTRUCTOR" && perfil?.rol !== "ADMIN" && perfil?.rol !== "GRADUADO_FWD") {
    redirect("/dashboard");
  }

  // Fetch most recent verification attempt
  const { data: verifications } = await supabase
    .from("InstructorVerification")
    .select("estado, puntuacion, comentario, revisadoEn, analisisIA")
    .eq("userId", user.id)
    .order("createdAt", { ascending: false })
    .limit(1);

  const prevVerification = verifications?.[0] ?? null;

  return (
    <div className="min-h-screen bg-[#0d0e14] py-8">
      <VipFwdClient
        isVerified={perfil?.isVerified ?? false}
        prevVerification={prevVerification as any}
      />
    </div>
  );
}
