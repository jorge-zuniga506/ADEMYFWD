import Swal from "sweetalert2";

// Estructura HTML estilizada para el logotipo de la aplicación en las alertas
const logoHeaderHtml = `
  <div style="display: flex; justify-content: center; margin-bottom: 10px;">
    <div style="background-color: #18181b; padding: 8px 18px; border-radius: 9999px; border: 1px solid #27272a; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 900; font-size: 14px; letter-spacing: -0.5px; color: #ffffff;">
        U-<span style="color: #06b6d4;">FORWARD</span>
      </span>
    </div>
  </div>
`;

/**
 * Muestra una alerta SweetAlert2 configurada con el estilo y logo de U-Forward.
 */
export function showAlert({
  title,
  text,
  icon = "info",
  confirmButtonText = "Entendido",
}: {
  title: string;
  text?: string;
  icon?: "success" | "error" | "warning" | "info" | "question";
  confirmButtonText?: string;
}) {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    html: `
      ${logoHeaderHtml}
      <div style="color: #a1a1aa; font-size: 14px; margin-top: 15px; font-family: sans-serif; line-height: 1.5;">
        ${text || ""}
      </div>
    `,
    background: "#09090b", // Fondo oscuro (zinc-950)
    color: "#ffffff",
    customClass: {
      popup: "border border-zinc-800 rounded-2xl shadow-2xl",
      title: "text-lg font-bold text-white tracking-tight pt-2 font-sans",
      confirmButton: "bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl border-0 transition-colors focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer",
    },
    buttonsStyling: false,
    confirmButtonText: confirmButtonText,
  });
}

/**
 * Muestra un diálogo de confirmación SweetAlert2 configurada con el estilo y logo de U-Forward.
 */
export function showConfirm({
  title,
  text,
  confirmButtonText = "Confirmar",
  cancelButtonText = "Cancelar",
}: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}) {
  return Swal.fire({
    title: title,
    html: `
      ${logoHeaderHtml}
      <div style="color: #a1a1aa; font-size: 14px; margin-top: 15px; font-family: sans-serif; line-height: 1.5;">
        ${text || ""}
      </div>
    `,
    background: "#09090b",
    color: "#ffffff",
    showCancelButton: true,
    buttonsStyling: false,
    customClass: {
      popup: "border border-zinc-800 rounded-2xl shadow-2xl",
      title: "text-lg font-bold text-white tracking-tight pt-2 font-sans",
      confirmButton: "bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl border-0 transition-colors mr-3 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer",
      cancelButton: "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs px-6 py-2.5 rounded-xl border border-zinc-700 transition-colors focus:ring-2 focus:ring-zinc-600 focus:outline-none cursor-pointer",
    },
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
  });
}
