"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import Logo from "@/components/Logo";

interface NavbarClientProps {
  userName?: string;
  isLoggedIn: boolean;
}

export default function NavbarClient({ userName, isLoggedIn }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/cursos", label: "Cursos" },
    { href: "/ruta", label: "Ruta" },
    { href: "/recursos", label: "Recursos" },
    { href: "/comunidad", label: "Comunidad" },
    { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/90 backdrop-blur-xl text-zinc-100">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight shrink-0">
          <Logo className="h-8 w-8" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right — Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {userName && (
                <span className="text-xs text-zinc-400 font-mono">{userName}</span>
              )}
              <Link href="/dashboard">
                <button className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-3.5 text-xs font-bold text-white transition-colors shadow-md shadow-purple-600/25 cursor-pointer">
                  <LayoutDashboard className="h-4 w-4" />
                  Panel
                </button>
              </Link>
              <form action="/auth/logout" method="post">
                <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-800 px-3 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/login">
              <button className="relative rounded-full px-5 py-2 text-xs font-bold text-white border border-cyan-500/50 hover:border-cyan-400 bg-transparent transition shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer">
                Iniciar sesión
              </button>
            </Link>
          )}
        </div>

        {/* Hamburger — Mobile */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-900 bg-black/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 mt-3 border-t border-zinc-900 space-y-2">
            {isLoggedIn ? (
              <>
                {userName && (
                  <p className="px-3 text-xs text-zinc-500 font-mono">{userName}</p>
                )}
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    Panel de Control
                  </button>
                </Link>
                <form action="/auth/logout" method="post">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </button>
                </form>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full flex items-center justify-center h-10 rounded-xl border border-cyan-500/50 hover:border-cyan-400 text-xs font-bold text-white transition cursor-pointer">
                  Iniciar Sesión
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
