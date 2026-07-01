"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuestion(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const titulo = formData.get("titulo") as string;
  const contenido = formData.get("contenido") as string;
  const courseId = formData.get("courseId") as string;

  const { error } = await supabase.from("Question").insert({
    userid: user.id,
    courseid: courseId,
    titulo,
    contenido,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/student/qanda");
  revalidatePath(`/courses/${courseId}`);
}

export async function createRespuesta(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const contenido = formData.get("contenido") as string;
  const questionId = formData.get("questionId") as string;

  const { error } = await supabase.from("Respuesta").insert({
    userid: user.id,
    questionid: questionId,
    contenido,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/student/qanda/${questionId}`);
}

export async function marcarResuelta(questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("Question")
    .update({ resuelta: true })
    .eq("id", questionId)
    .eq("userid", user.id);

  revalidatePath(`/dashboard/student/qanda/${questionId}`);
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase
    .from("Question")
    .delete()
    .eq("id", questionId)
    .eq("userid", user.id);

  revalidatePath("/dashboard/student/qanda");
}
