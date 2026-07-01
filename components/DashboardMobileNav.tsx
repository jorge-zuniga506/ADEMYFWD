"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

interface Props {
  items: NavItem[];      // 5 items para la barra inferior
  allItems: NavItem[];   // todos los items para el menú completo
  nombre: string;
}

export default function DashboardMobileNav({ items, allItems, nombre }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Barra inferior fija — visible solo en móvil */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-around h-16 px-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-zinc-500 hover:text-white transition-colors group"
            >
              <item.icon className="h-5 w-5 group-hover:text-purple-400 transition-colors" />
              <span className="text-[10px] font-medium leading-none truncate max-w-[52px] text-center">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          ))}
          {/* Botón "más" para ver todos los items */}
          {allItems.length > 5 && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">Más</span>
            </button>
          )}
        </div>
      </nav>

      {/* Drawer lateral con todos los items — móvil */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Panel deslizable desde la izquierda */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Header del drawer */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <p className="text-sm font-bold text-white">{nombre}</p>
                <p className="text-xs text-zinc-500">Panel de Control</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Lista completa de navegación */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {allItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-zinc-500" />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer del drawer */}
            <div className="p-4 border-t border-zinc-800">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition"
              >
                ← Volver al Inicio
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
