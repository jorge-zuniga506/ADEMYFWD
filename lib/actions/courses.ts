"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const titulo = formData.get("titulo") as string;
  const descripcion = formData.get("descripcion") as string;
  const precio = parseFloat(formData.get("precio") as string) || 0;
  const categoryId = formData.get("categoryId") as string;
  const esExclusivoFwd = formData.get("esExclusivoFwd") === "on";

  const { data: course, error } = await supabase
    .from("Course")
    .insert({
      instructorId: user.id,
      categoryId,
      titulo,
      descripcion,
      precio,
      esExclusivoFwd,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/instructor");
  redirect(`/dashboard/instructor/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const titulo = formData.get("titulo") as string;
  const descripcion = formData.get("descripcion") as string;
  const precio = parseFloat(formData.get("precio") as string) || 0;
  const categoryId = formData.get("categoryId") as string;
  const esExclusivoFwd = formData.get("esExclusivoFwd") === "on";
  const videoUrl = formData.get("videoUrl") as string;
  const duracionHoras = parseFloat(formData.get("duracionHoras") as string) || 0;

  const { error } = await supabase
    .from("Course")
    .update({ 
      titulo, 
      descripcion, 
      precio, 
      categoryId, 
      esExclusivoFwd,
      videoUrl: videoUrl || null,
      duracionHoras: duracionHoras || null
    })
    .eq("id", courseId)
    .eq("instructorId", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/instructor");
  redirect("/dashboard/instructor");
}

export async function createSection(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const titulo = formData.get("titulo") as string;
  const orden = parseInt(formData.get("orden") as string) || 0;

  await supabase.from("Section").insert({
    courseId,
    titulo,
    orden,
  });

  revalidatePath(`/dashboard/instructor/${courseId}`);
}

export async function createLesson(sectionId: string, courseId: string, formData: FormData) {
  const supabase = await createClient();
  const titulo = formData.get("titulo") as string;
  const videoUrl = formData.get("videoUrl") as string;
  const orden = parseInt(formData.get("orden") as string) || 0;
  const esGratis = formData.get("esGratis") === "on";
  const recursoUrl = formData.get("recursoUrl") as string;
  const recursoNombre = formData.get("recursoNombre") as string;

  await supabase.from("Lesson").insert({
    sectionId,
    titulo,
    videoUrl,
    orden,
    esGratis,
    recursoUrl: recursoUrl || null,
    recursoNombre: recursoNombre || null,
  });

  revalidatePath(`/dashboard/instructor/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("Course")
    .delete()
    .eq("id", courseId)
    .eq("instructorId", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/instructor");
  redirect("/dashboard/instructor");
}

export async function deleteSection(sectionId: string, courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify ownership of the course
  const { data: course } = await supabase
    .from("Course")
    .select("instructorId")
    .eq("id", courseId)
    .single();

  if (!course || course.instructorId !== user.id) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("Section")
    .delete()
    .eq("id", sectionId)
    .eq("courseId", courseId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/instructor/${courseId}`);
}

export async function deleteLesson(lessonId: string, sectionId: string, courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify ownership of the course
  const { data: course } = await supabase
    .from("Course")
    .select("instructorId")
    .eq("id", courseId)
    .single();

  if (!course || course.instructorId !== user.id) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("Lesson")
    .delete()
    .eq("id", lessonId)
    .eq("sectionId", sectionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/instructor/${courseId}`);
}
