import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  MessageSquare,
  Award,
  Settings,
  BarChart3,
  GraduationCap,
  Wallet,
  User,
  ShieldCheck,
  DollarSign,
  Users,
  Crown,
  ChevronLeft,
} from "lucide-react";
import AiSupportChat from "@/components/ai/AiSupportChat";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: perfil } = await supabase
    .from("User")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  const rol = perfil?.rol;
  const nombre = perfil?.nombre ?? user.email?.split("@")[0] ?? "Usuario";

  const navItems = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  ];

  if (rol === "ESTUDIANTE" || rol === "GRADUADO_FWD") {
    navItems.push(
      { href: "/dashboard/student", label: "Mis Cursos", icon: BookOpen },
      { href: "/dashboard/student/membresia", label: "Membresía VIP", icon: Crown },
      { href: "/dashboard/student/player", label: "Reproductor", icon: PlayCircle },
      { href: "/dashboard/student/qanda", label: "Q&A", icon: MessageSquare },
      { href: "/dashboard/student/certificados", label: "Certificados", icon: Award },
      { href: "/dashboard/student/configuracion", label: "Configuracion", icon: Settings },
    );
  }

  if (rol === "INSTRUCTOR" || rol === "ADMIN") {
    navItems.push(
      { href: "/dashboard/instructor", label: "Panel Instructor", icon: BarChart3 },
      { href: "/dashboard/instructor/aula", label: "Aula Virtual", icon: GraduationCap },
      { href: "/dashboard/instructor/vip-fwd", label: "VIP + FWD", icon: Crown },
      { href: "/dashboard/instructor/wallet", label: "Wallet", icon: Wallet },
      { href: "/dashboard/instructor/perfil", label: "Perfil Instructor", icon: User },
    );
  }

  if (rol === "ADMIN") {
    navItems.push(
      { href: "/dashboard/admin/verificacion", label: "Verificacion", icon: ShieldCheck },
      { href: "/dashboard/admin/instructores-vip", label: "Instructores VIP+FWD", icon: Crown },
      { href: "/dashboard/admin/membresias", label: "Membresías", icon: DollarSign },
      { href: "/dashboard/admin/cursos", label: "Auditoria", icon: BookOpen },
      { href: "/dashboard/admin/financiero", label: "Financiero", icon: DollarSign },
      { href: "/dashboard/admin/usuarios", label: "Usuarios", icon: Users },
      { href: "/dashboard/admin/vip", label: "VIP", icon: Crown },
    );
  }

  if (!rol) {
    navItems.push(
      { href: "/dashboard/student", label: "Mis Cursos", icon: BookOpen },
      { href: "/dashboard/student/configuracion", label: "Configuracion", icon: Settings },
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Inicio
        </Link>

        <p className="mb-3 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {nombre}
        </p>

        {!rol && (
          <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
            Perfil incompleto — ejecuta <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">npm run seed</code>
          </p>
        )}

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <item.icon className="h-4 w-4 shrink-0 text-zinc-400" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
      <AiSupportChat />
    </div>
  );
}
