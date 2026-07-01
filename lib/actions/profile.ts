"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Service-role client (bypasses RLS) for storage operations
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const nombre = formData.get("nombre") as string;
  const bio = formData.get("bio") as string;

  const redesRaw = formData.get("redesSociales") as string;
  const redesSociales: Record<string, string> = {};
  if (redesRaw) {
    redesRaw.split("\n").forEach((line) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx > -1) {
        const key = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        if (key && val) redesSociales[key] = val;
      }
    });
  }

  // Handle avatar upload
  const avatarFile = formData.get("avatar") as File | null;
  let avatarUrl: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    const service = getServiceClient();
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await service.storage
      .from("avatars")
      .upload(path, avatarFile, {
        upsert: true,
        contentType: avatarFile.type,
        cacheControl: "3600",
      });

    if (!uploadError) {
      const { data: urlData } = service.storage
        .from("avatars")
        .getPublicUrl(path);
      // Bust cache by appending timestamp
      avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    } else {
      console.error("Avatar upload error:", uploadError);
    }
  }

  const updatePayload: Record<string, unknown> = {
    nombre,
    bio,
    redessociales: redesSociales,
  };
  if (avatarUrl) updatePayload.avatarUrl = avatarUrl;

  await supabase
    .from("User")
    .update(updatePayload as any)
    .eq("id", user.id);

  revalidatePath("/dashboard/instructor/perfil");
  revalidatePath("/dashboard/student/configuracion");
  revalidatePath("/dashboard");
}
