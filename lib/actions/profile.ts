"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const nombre = formData.get("nombre") as string;
  const bio = formData.get("bio") as string;

  const redesRaw = formData.get("redesSociales") as string;
  let redesSociales: Record<string, string> = {};
  if (redesRaw) {
    redesRaw.split("\n").forEach((line) => {
      const [key, val] = line.split(":").map((s) => s.trim());
      if (key && val) redesSociales[key] = val;
    });
  }

  await supabase
    .from("User")
    .update({ nombre, bio, redesSociales })
    .eq("id", user.id);

  revalidatePath("/dashboard/instructor/perfil");
  revalidatePath("/dashboard/student/configuracion");
}
