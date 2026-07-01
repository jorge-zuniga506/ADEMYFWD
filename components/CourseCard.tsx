import Link from "next/link";
import { Badge } from "@/components/ui";
import { Clock, Star } from "lucide-react";

interface CourseCardProps {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  esExclusivoFwd: boolean;
}

export default function CourseCard({
  id,
  titulo,
  descripcion,
  precio,
  esExclusivoFwd,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="aspect-video bg-gradient-to-br from-primary-100 via-zinc-100 to-zinc-200 dark:from-primary-950 dark:via-zinc-900 dark:to-zinc-800">
        <div className="flex h-full items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-white/40 backdrop-blur-sm dark:bg-black/40" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {esExclusivoFwd && <Badge variant="fwd">FWD+</Badge>}
        </div>

        <h3 className="font-semibold leading-snug transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">
          {titulo}
        </h3>

        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
          {descripcion}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold tracking-tight">
            {precio === 0 ? "Gratis" : `$${precio.toFixed(2)}`}
          </span>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
              0.0
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              0h
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
