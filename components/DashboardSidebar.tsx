"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
}

export default function DashboardSidebar({ title, subtitle, items }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-zinc-200 bg-zinc-50/50 p-4 md:w-64 md:border-b-0 md:border-r md:p-6 dark:border-zinc-800 dark:bg-zinc-950/50">
      <div className="mb-6 hidden md:block">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        )}
      </div>

      <nav className="flex flex-row flex-wrap gap-1 md:flex-col">
        {items.map((item) => {
          const Icon = item.icon;
          // Exact match or sub-path match to keep highlighting active
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary-600 dark:text-primary-400" : "text-zinc-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
