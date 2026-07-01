"use client";

import { BookOpen, MessageSquare, Award, Settings } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

export default function StudentSidebar() {
  const items = [
    { href: "/dashboard/student", label: "Mis Cursos", icon: BookOpen },
    { href: "/dashboard/student/qanda", label: "Q&A", icon: MessageSquare },
    { href: "/dashboard/student/certificados", label: "Certificados", icon: Award },
    { href: "/dashboard/student/configuracion", label: "Configuración", icon: Settings },
  ];

  return <DashboardSidebar title="Estudiante" subtitle="Panel de Control" items={items} />;
}
