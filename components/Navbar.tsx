import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, LogOut } from "lucide-react";
import Logo from "@/components/Logo";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let perfil = null;
  if (user) {
    const { data } = await supabase
      .from("User")
      .select("nombre, rol")
      .eq("id", user.id)
      .single();
    perfil = data;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/90 backdrop-blur-xl text-zinc-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
        >
          <Logo className="h-8 w-8" />
        </Link>

        {/* Center Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/cursos" className="hover:text-white transition-colors">Cursos</Link>
          <Link href="/ruta" className="hover:text-white transition-colors">Ruta</Link>
          <Link href="/recursos" className="hover:text-white transition-colors">Recursos</Link>
          <Link href="/comunidad" className="hover:text-white transition-colors">Comunidad</Link>
          <Link href="/sobre-nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-zinc-400 font-mono">
                {perfil?.nombre ?? user.email?.split("@")[0]}
              </span>
              <Link href="/dashboard">
                <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 text-xs font-bold text-white transition-colors shadow-md shadow-purple-600/25">
                  <LayoutDashboard className="h-4 w-4" />
                  Panel Control
                </button>
              </Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-800 px-3 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link href="/auth/login">
              <button className="relative rounded-full px-5 py-2 text-xs font-bold text-white border border-cyan-500/50 hover:border-cyan-400 bg-transparent transition shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                Iniciar sesión
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
