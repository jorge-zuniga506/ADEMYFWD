"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("User")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "ADMIN") redirect("/dashboard");
  return { supabase, user };
}

export async function approveFwdCredential(credentialId: string, userId: string) {
  const { supabase } = await requireAdmin();

  await supabase
    .from("FwdCredential")
    .update({ estado: "APROBADA" })
    .eq("id", credentialId);

  await supabase
    .from("User")
    .update({ rol: "GRADUADO_FWD" })
    .eq("id", userId);

  revalidatePath("/dashboard/admin/verificacion");
}

export async function rejectFwdCredential(credentialId: string, notas: string) {
  const { supabase } = await requireAdmin();

  await supabase
    .from("FwdCredential")
    .update({ estado: "RECHAZADA", notasAdmin: notas })
    .eq("id", credentialId);

  revalidatePath("/dashboard/admin/verificacion");
}

export async function publishCourse(courseId: string) {
  const { supabase } = await requireAdmin();

  await supabase
    .from("Course")
    .update({ estado: "PUBLICADO" })
    .eq("id", courseId);

  revalidatePath("/dashboard/admin/cursos");
}

export async function returnCourse(courseId: string, notas: string) {
  const { supabase } = await requireAdmin();

  await supabase
    .from("Course")
    .update({ estado: "BORRADOR" })
    .eq("id", courseId);

  if (notas.trim()) {
    await supabase.from("CourseReview").insert({
      userId: (await supabase.auth.getUser()).data.user!.id,
      courseId,
      estrellas: 0,
      comentario: `Devolucion del admin: ${notas}`,
    });
  }

  revalidatePath("/dashboard/admin/cursos");
}

export async function updateUserRole(userId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const nuevoRol = formData.get("nuevoRol") as string;

  await supabase.from("User").update({ rol: nuevoRol as any }).eq("id", userId);
  revalidatePath("/dashboard/admin/usuarios");
}

export async function approveJobPost(postId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("FwdJobPost").update({ estado: "APROBADA" }).eq("id", postId);
  revalidatePath("/dashboard/admin/vip");
}

export async function rejectJobPost(postId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("FwdJobPost").update({ estado: "RECHAZADA" }).eq("id", postId);
  revalidatePath("/dashboard/admin/vip");
}

export async function approveInstructorVerification(verificationId: string, userId: string) {
  const { supabase } = await requireAdmin();

  await supabase
    .from("InstructorVerification")
    .update({ estado: "APROBADO", revisadoEn: new Date().toISOString() })
    .eq("id", verificationId);

  await supabase.from("User").update({ isVerified: true }).eq("id", userId);

  revalidatePath("/dashboard/admin/instructores-vip");
  revalidatePath("/cursos");
}

export async function rejectInstructorVerification(verificationId: string, notas: string) {
  const { supabase } = await requireAdmin();

  await supabase
    .from("InstructorVerification")
    .update({ estado: "RECHAZADO", comentario: notas, revisadoEn: new Date().toISOString() })
    .eq("id", verificationId);

  revalidatePath("/dashboard/admin/instructores-vip");
}

export async function processPayout(payoutId: string, actionType: "TRANSFERIDO" | "RECHAZADO") {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("PayoutRequest")
    .update({ 
      estado: actionType
    })
    .eq("id", payoutId);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/admin/financiero");
}
