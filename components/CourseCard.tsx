import Link from "next/link";
import { Clock, Star, Users, Crown } from "lucide-react";

interface CourseCardProps {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  esExclusivoFwd: boolean;
  duracionHoras?: number | null;
  categoryId?: string | null;
  instructorVerificado?: boolean;
}

const categoryImages: Record<string, string> = {
  "a1e0ee0c-83b3-4f51-b0e7-8be5f2f46e01": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80", // Frontend
  "b2e0ee0c-83b3-4f51-b0e7-8be5f2f46e02": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80", // Backend
  "c3e0ee0c-83b3-4f51-b0e7-8be5f2f46e03": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80", // DevOps
  "d4e0ee0c-83b3-4f51-b0e7-8be5f2f46e04": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80", // Mobile
  "e5e0ee0c-83b3-4f51-b0e7-8be5f2f46e05": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // Data Science
  "f6e0ee0c-83b3-4f51-b0e7-8be5f2f46e06": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80", // UI/UX
  "a7e0ee0c-83b3-4f51-b0e7-8be5f2f46e07": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Cloud
  "b8e0ee0c-83b3-4f51-b0e7-8be5f2f46e08": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80", // Blockchain
  "c9e0ee0c-83b3-4f51-b0e7-8be5f2f46e09": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // Ciberseguridad
  "dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80" // Inteligencia Artificial
};

const courseImages: Record<string, string> = {
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80", // course-react
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e13": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80", // course-next
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e17": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80", // course-html-css
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80", // course-node
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e16": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80", // course-nestjs
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e14": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80", // course-docker
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e18": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=800&q=80", // course-devops-cicd
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e19": "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80", // course-flutter
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e20": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80", // course-react-native
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e21": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // course-python-data
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e22": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800&q=80", // course-deep-learning
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e23": "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80", // course-figma-complete
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e24": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80", // course-adobe-xd
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e25": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // course-aws-practitioner
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e26": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80", // course-azure-complete
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e27": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80", // course-blockchain-solid
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e28": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80", // course-web3-dapps
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e29": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // course-ethical-hacking
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e30": "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80", // course-security-owasp
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e31": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80", // course-claude-complete
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e32": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", // course-claude-master
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e33": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", // course-n8n-mcp
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e34": "https://images.unsplash.com/photo-1684126743128-44bd7ea1f0c2?auto=format&fit=crop&w=800&q=80", // course-ia-generativa
  "e1c0ffee-83b3-4f51-b0e7-8be5f2f46e35": "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80", // course-ia-100
};

export default function CourseCard({
  id,
  titulo,
  descripcion,
  precio,
  esExclusivoFwd,
  duracionHoras,
  categoryId,
  instructorVerificado,
}: CourseCardProps) {
  // Select cover image
  const imageUrl = courseImages[id] || categoryImages[categoryId ?? ""] || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";

  // Deterministic realistic rating and duration
  const rating = (4.3 + (titulo.length % 7) * 0.1).toFixed(1);
  const studentsCount = 120 + (titulo.length % 9) * 85;
  const hours = duracionHoras || (5 + (titulo.length % 15));

  return (
    <Link
      href={`/courses/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-[0_10px_20px_rgba(124,58,237,0.1)]"
    >
      {/* Course Image Wrapper */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900 border-b border-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={titulo}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded-md">
            {esExclusivoFwd ? "Exclusivo U-Forward" : "Especialización"}
          </span>
          {instructorVerificado && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md">
              <Crown className="h-3 w-3" />
              Verificado FWD+
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm leading-snug text-zinc-100 transition-colors group-hover:text-purple-400">
          {titulo}
        </h3>

        <p className="line-clamp-2 text-xs text-zinc-400">
          {descripcion}
        </p>

        {/* Rating and Duration */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-zinc-900 pt-3 mt-auto">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
            <span className="font-bold text-zinc-300">{rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>{hours} horas</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-zinc-400" />
            <span>{studentsCount} alumnos</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-black tracking-tight text-white">
            {precio === 0 ? "Gratis" : `$${precio.toFixed(2)}`}
          </span>
          <span className="text-[10px] font-semibold text-purple-400 group-hover:underline">
            Ver detalles →
          </span>
        </div>
      </div>
    </Link>
  );
}
