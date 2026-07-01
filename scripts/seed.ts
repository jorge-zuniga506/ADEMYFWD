import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/app/generated/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createOrGetUser(email: string, password: string, metadata: Record<string, string>) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users.find((u) => u.email === email);
  if (found) return found;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });
  if (error) throw error;
  return data.user;
}

async function seed() {
  console.log("Seed: Creando usuarios...");

  const admin = await createOrGetUser("admin@fwd.academy", "Admin123!", { nombre: "Admin FWD" });
  await supabase.from("User").upsert({
    id: admin.id,
    nombre: "Admin FWD",
    email: "admin@fwd.academy",
    passwordHash: "",
    rol: "ADMIN",
  });

  const instructor = await createOrGetUser("instructor@fwd.academy", "Instr123!", { nombre: "Carlos Instructor" });
  await supabase.from("User").upsert({
    id: instructor.id,
    nombre: "Carlos Instructor",
    email: "instructor@fwd.academy",
    passwordHash: "",
    rol: "INSTRUCTOR",
  });

  const student = await createOrGetUser("estudiante@fwd.academy", "Estu123!", { nombre: "Maria Estudiante" });
  await supabase.from("User").upsert({
    id: student.id,
    nombre: "Maria Estudiante",
    email: "estudiante@fwd.academy",
    passwordHash: "",
    rol: "ESTUDIANTE",
  });

  console.log("Usuarios listos");

  const { data: cats } = await supabase.from("Category").select("id, nombre");
  const frontendCat = cats?.find((c) => c.nombre === "Frontend");
  const backendCat = cats?.find((c) => c.nombre === "Backend");

  if (frontendCat && backendCat) {
    const { data: course } = await supabase
      .from("Course")
      .insert({
        instructorId: instructor.id,
        categoryId: frontendCat.id,
        titulo: "React desde cero",
        descripcion: "Aprende React con TypeScript y buenas practicas.",
        precio: 29.99,
        esExclusivoFwd: false,
      })
      .select()
      .single();

    if (course) {
      const { data: section } = await supabase
        .from("Section")
        .insert({ courseId: course.id, titulo: "Introduccion", orden: 1 })
        .select()
        .single();

      if (section) {
        await supabase.from("Lesson").insert([
          { sectionId: section.id, titulo: "Que es React?", videoUrl: "https://example.com/video1", orden: 1, esGratis: true },
          { sectionId: section.id, titulo: "Configuracion del entorno", videoUrl: "https://example.com/video2", orden: 2, esGratis: true },
          { sectionId: section.id, titulo: "Componentes y Props", videoUrl: "https://example.com/video3", orden: 3, esGratis: false },
        ]);
      }

      await supabase.from("Enrollment").upsert(
        { userId: student.id, courseId: course.id, progreso: 30 },
        { onConflict: "userId, courseId" }
      );

      await supabase.from("CourseReview").upsert(
        { userId: student.id, courseId: course.id, estrellas: 5, comentario: "Excelente curso, muy bien explicado." },
        { onConflict: "userId, courseId" }
      );
    }

    await supabase.from("Course").upsert(
      {
        instructorId: instructor.id,
        categoryId: backendCat.id,
        titulo: "Node.js Avanzado",
        descripcion: "APIs REST, autenticacion y base de datos con Node.js.",
        precio: 39.99,
        esExclusivoFwd: true,
      },
      { onConflict: "titulo" }
    );
  }

  console.log("Cursos y datos de ejemplo creados");
  console.log("Seed completado!");
}

seed().catch(console.error);
