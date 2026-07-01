"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveLiveMeet(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const courseId = formData.get("courseId") as string;
  const liveMeetLink = formData.get("liveMeetLink") as string;
  const liveMeetFecha = formData.get("liveMeetFecha") as string;

  const { error } = await supabase
    .from("Course")
    .update({ 
      liveMeetLink: liveMeetLink || null, 
      liveMeetFecha: liveMeetFecha || null 
    })
    .eq("id", courseId)
    .eq("instructorId", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/instructor/aula`);
}

export async function sendAnnouncement(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const titulo = formData.get("titulo") as string;
  const contenido = formData.get("contenido") as string;

  console.log(`[ANUNCIO] De: ${user.email} | Para Curso: ${courseId} | Título: ${titulo} | Contenido: ${contenido}`);
  
  // Return message to client by returning a value
  return { success: true, message: "Anuncio enviado con éxito por correo masivo (simulado)" };
}

export async function requestPayout(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const cantidad = parseFloat(formData.get("cantidad") as string);
  const metodo = formData.get("metodo") as string;
  const cuenta = formData.get("cuenta") as string;

  if (!cantidad || cantidad <= 0 || !metodo || !cuenta) {
    throw new Error("Datos inválidos para la solicitud de retiro.");
  }

  const { error } = await supabase
    .from("PayoutRequest")
    .insert({
      userId: user.id,
      cantidad,
      metodo,
      cuenta,
      estado: "PENDIENTE"
    });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/instructor/wallet");
}
