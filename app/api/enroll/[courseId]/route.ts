import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  await supabase.from("Enrollment").insert({
    userId: user.id,
    courseId,
    progreso: 0,
  });

  redirect(`/courses/${courseId}`);
}
