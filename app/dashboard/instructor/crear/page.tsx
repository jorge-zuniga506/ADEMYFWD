import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCourse } from "@/lib/actions/courses";
import { Button, Input } from "@/components/ui";
import { ChevronLeft } from "lucide-react";

export default async function CreateCoursePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("User")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "INSTRUCTOR" && perfil?.rol !== "ADMIN") {
    redirect("/dashboard");
  }

  const { data: categories } = await supabase.from("Category").select("id, nombre");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
      <Link
        href="/dashboard/instructor"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al panel
      </Link>

      <h1 className="mb-8 text-3xl font-bold tracking-tight">Crear curso</h1>

      <form action={createCourse} className="flex flex-col gap-5">
        <Input
          label="Titulo"
          name="titulo"
          required
          placeholder="Ej: React desde cero"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Descripcion
          </label>
          <textarea
            name="descripcion"
            required
            rows={4}
            placeholder="Describe de que trata el curso..."
            className="h-24 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-primary-400"
          />
        </div>

        <Input
          label="Precio ($)"
          name="precio"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Categoria
          </label>
          <select
            name="categoryId"
            required
            className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm transition-colors focus:border-primary-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-primary-400"
          >
            <option value="">Seleccionar...</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="esExclusivoFwd"
            className="h-4 w-4 rounded border-zinc-300 text-primary-600 focus:ring-primary-500"
          />
          <span>Curso exclusivo U-Forward+</span>
        </label>

        <Button type="submit" size="lg" className="self-start">
          Crear curso
        </Button>
      </form>
    </main>
  );
}
