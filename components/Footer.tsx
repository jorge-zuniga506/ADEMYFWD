import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-gray-400 py-12 font-sans mt-auto border-t border-neutral-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sección Superior: Enlaces e Información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Columna 1: Logo y Descripción */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-8" />
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-neutral-400">
              Cursos premium en video con progreso, certificados y comunidad. Frontend, backend y lógica web para la comunidad U-Forward.
            </p>
          </div>

          {/* Columna 2: Plataforma */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Plataforma</h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/cursos" className="hover:text-white transition-colors">Cursos</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Registrarse</Link></li>
            </ul>
          </div>

          {/* Columna 3: Comunidad */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm">Comunidad</h3>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">U-Forward+</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Blog</span></li>
            </ul>
          </div>

        </div>

        {/* Sección Inferior: Copyright y Logo secundario */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center relative gap-4">
          
          {/* Logo Circular "N" en la esquina inferior izquierda */}
          <div className="md:absolute left-0 w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center bg-black">
            <span className="text-white text-sm font-light">N</span>
          </div>
          
          {/* Texto de Derechos Reservados centrado */}
          <div className="w-full text-center text-sm text-neutral-500">
            © 2026 U-Forward. Todos los derechos reservados.
          </div>
          
        </div>

      </div>
    </footer>
  );
};

export default Footer;
