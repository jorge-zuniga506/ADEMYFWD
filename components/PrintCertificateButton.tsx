"use client";

import { Printer, Share2 } from "lucide-react";

export default function PrintCertificateButton({ courseTitle }: { courseTitle: string }) {
  const handleShare = () => {
    const text = `¡Me acabo de graduar del curso "${courseTitle}" en FWD Academy! 🎓🚀`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://fwd.academy/certificados/" + courseTitle.toLowerCase().replace(/ /g, "-"))}`;
    window.open(shareUrl, "_blank");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => window.print()}
        className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primary-700 hover:scale-102 flex items-center justify-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Descargar Certificado (PDF)
      </button>
      <button
        onClick={handleShare}
        className="rounded-xl bg-zinc-800 px-6 py-3 text-sm font-bold text-zinc-100 shadow-lg transition hover:bg-zinc-750 hover:scale-102 flex items-center justify-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Compartir en LinkedIn
      </button>
    </div>
  );
}
