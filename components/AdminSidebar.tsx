"use client";

import { ShieldCheck, BookOpen, Users, Crown, DollarSign } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

export default function AdminSidebar() {
  const items = [
    { href: "/dashboard/admin/verificacion", label: "Verificaciones", icon: ShieldCheck },
    { href: "/dashboard/admin/cursos", label: "Cursos", icon: BookOpen },
    { href: "/dashboard/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/dashboard/admin/vip", label: "VIP", icon: Crown },
    { href: "/dashboard/admin/financiero", label: "Finanzas", icon: DollarSign },
  ];

  return <DashboardSidebar title="Administrador" subtitle="Panel de Control" items={items} />;
}
