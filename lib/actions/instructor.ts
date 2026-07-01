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

export async function generateGoogleMeetLink(courseId: string, summary: string, dateStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

  // Check if we have Google Calendar API credentials configured
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
    try {
      console.log("[GOOGLE CALENDAR API] Intentando generar enlace de Google Meet real...");
      
      // 1. Refresh OAuth access token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: GOOGLE_REFRESH_TOKEN,
          grant_type: "refresh_token",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_description || "Error al refrescar el token de Google");
      }

      const accessToken = tokenData.access_token;

      // 2. Create Calendar event with conference data to generate a Meet link
      const startDateTime = new Date(dateStr).toISOString();
      const endDateTime = new Date(new Date(dateStr).getTime() + 60 * 60 * 1000).toISOString(); // 1 hour duration

      const eventRes = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: `Mentoría en Vivo: ${summary}`,
            description: "Creado automáticamente desde U-Forward",
            start: { dateTime: startDateTime },
            end: { dateTime: endDateTime },
            conferenceData: {
              createRequest: {
                requestId: `u-forward-meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          }),
        }
      );

      const eventData = await eventRes.json();
      if (!eventRes.ok) {
        throw new Error(eventData.error?.message || "Error al crear evento de Google Calendar");
      }

      const meetLink = eventData.conferenceData?.entryPoints?.[0]?.uri;
      if (meetLink) {
        console.log(`[GOOGLE CALENDAR API] Enlace real generado: ${meetLink}`);
        return { success: true, link: meetLink };
      }
    } catch (apiError: unknown) {
      const msg = apiError instanceof Error ? apiError.message : String(apiError);
      console.error("[GOOGLE CALENDAR API] Falló el API real, usando simulador:", msg);
    }
  }

  // Fallback / Simulator: Generate a realistic mock Google Meet link
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const mockLink = `https://meet.google.com/${part1}-${part2}-${part3}`;

  console.log(`[GOOGLE CALENDAR API] Enlace simulado generado: ${mockLink}`);
  return { 
    success: true, 
    link: mockLink, 
    isSimulated: true, 
    message: "Generado en modo de simulación (agrega GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN en tu .env.local para usar llamadas reales)." 
  };
}
