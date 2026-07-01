"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  GitFork,
  Link2,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  Camera,
  X,
} from "lucide-react";

interface ProfileFormProps {
  perfil: {
    nombre: string | null;
    email: string | null;
    rol: string | null;
    bio: string | null;
    redesSociales: Record<string, string> | null;
    avatarUrl: string | null;
  };
  updateAction: (formData: FormData) => Promise<void>;
}

export default function ProfileForm({ perfil, updateAction }: ProfileFormProps) {
  const redes = perfil.redesSociales as Record<string, string> | null;

  // Form states
  const [nombre, setNombre] = useState(perfil.nombre || "");
  const [bio, setBio] = useState(perfil.bio || "");

  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState<string | null>(perfil.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social links states
  const [github, setGithub] = useState(redes?.github || "");
  const [linkedin, setLinkedin] = useState(redes?.linkedin || "");
  const [twitter, setTwitter] = useState(redes?.twitter || "");
  const [website, setWebsite] = useState(redes?.website || "");

  // Submission/UX states
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setStatusMsg("La imagen no puede superar los 5 MB.");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setStatusMsg("");

    try {
      const lines: string[] = [];
      if (github) lines.push(`github: ${github.trim()}`);
      if (linkedin) lines.push(`linkedin: ${linkedin.trim()}`);
      if (twitter) lines.push(`twitter: ${twitter.trim()}`);
      if (website) lines.push(`website: ${website.trim()}`);

      const formData = new FormData();
      formData.append("nombre", nombre.trim());
      formData.append("bio", bio.trim());
      formData.append("redesSociales", lines.join("\n"));

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await updateAction(formData);

      setStatus("success");
      setStatusMsg("¡Perfil actualizado con éxito!");
      setAvatarFile(null);

      setTimeout(() => {
        setStatus("idle");
        setStatusMsg("");
      }, 4000);
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setStatusMsg(err instanceof Error ? err.message : "Ocurrió un error al actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">

      {/* STATUS NOTIFICATIONS */}
      {status === "success" && (
        <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-900/5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {status === "error" && (
        <div className="bg-rose-950/40 border border-rose-800/40 text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-rose-900/5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-[#13141c] border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-8">

        {/* Avatar Upload Row */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-800/60">
          {/* Avatar clickable area */}
          <div className="relative group shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              id="avatar-input"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* Avatar preview or initials */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-24 w-24 rounded-full overflow-hidden relative focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all"
              title="Cambiar foto de perfil"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl tracking-wider shadow-lg shadow-purple-600/10">
                  {getInitials(nombre)}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-1">
                <Camera className="h-5 w-5 text-white" />
                <span className="text-[10px] text-white font-semibold">Cambiar</span>
              </div>
            </button>

            {/* Remove button when preview exists */}
            {(avatarPreview || avatarFile) && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 flex items-center justify-center transition-all"
                title="Quitar imagen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Identity info + upload hint */}
          <div className="text-center sm:text-left space-y-1.5">
            <h3 className="text-lg font-bold text-white leading-none">{nombre || "Usuario"}</h3>
            <p className="text-xs text-zinc-500 font-mono flex items-center justify-center sm:justify-start gap-1">
              <Mail className="h-3 w-3 inline" /> {perfil.email}
            </p>
            <div className="pt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-300">
                {perfil.rol}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 pt-1">
              JPG, PNG, WebP o GIF · Máx 5 MB
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
            >
              {avatarPreview ? "Cambiar foto" : "Subir foto de perfil"}
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Column: Personal details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Información Básica
            </h4>

            <div className="space-y-1">
              <label htmlFor="nombre" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                />
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                Correo Electrónico (No modificable)
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={perfil.email || ""}
                  disabled
                  className="w-full bg-zinc-950/80 border border-zinc-900 rounded-xl pl-10 pr-4 py-3 text-xs text-zinc-500 cursor-not-allowed font-mono"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-800" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="bio" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Biografía / Resumen
              </label>
              <div className="relative">
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti, tu trayectoria académica o profesional..."
                  rows={4}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 leading-relaxed"
                />
                <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
              </div>
            </div>
          </div>

          {/* Right Column: Social Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Redes Sociales y Enlaces
            </h4>

            <div className="space-y-1">
              <label htmlFor="github" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                GitHub URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="github"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/tu_usuario"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/50 font-mono"
                />
                <GitFork className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="linkedin" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                LinkedIn URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/tu_usuario"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/50 font-mono"
                />
                <Link2 className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="twitter" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Twitter / X URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/tu_usuario"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/50 font-mono"
                />
                <ExternalLink className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="website" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Sitio Web Personal
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://mipagina.com"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/50 font-mono"
                />
                <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2 border-t border-zinc-800/60">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-purple-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Guardando cambios...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
