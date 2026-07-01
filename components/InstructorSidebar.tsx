"use client";

import { BarChart3, PlusCircle, GraduationCap, User, Wallet } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

export default function InstructorSidebar() {
  const items = [
    { href: "/dashboard/instructor", label: "Métricas", icon: BarChart3 },
    { href: "/dashboard/instructor/crear", label: "Crear Curso", icon: PlusCircle },
    { href: "/dashboard/instructor/aula", label: "Aula Virtual", icon: GraduationCap },
    { href: "/dashboard/instructor/perfil", label: "Perfil", icon: User },
    { href: "/dashboard/instructor/wallet", label: "Wallet", icon: Wallet },
  ];

  return <DashboardSidebar title="Instructor" subtitle="Panel de Control" items={items} />;
}
