import nodemailer from "nodemailer";
import { createClient as createServiceClient } from "@supabase/supabase-js";

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function generateEmailTemplate(title: string, details: { label: string; value: string }[]) {
  const detailsHtml = details.map((d, index) => `
    <tr style="${index % 2 === 0 ? 'background-color: #121214;' : 'background-color: #161619;'}">
      <td style="padding: 16px 20px; border-bottom: 1px solid #1f1f23; font-size: 13px; color: #a1a1aa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 500;">
        ${d.label}
      </td>
      <td style="padding: 16px 20px; border-bottom: 1px solid #1f1f23; font-size: 13px; color: #ffffff; text-align: right; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600;">
        ${d.value}
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!-- Importar tipografías premium de Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
  <style>
    /* Estilos responsivos y correcciones de renderizado */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 10px !important;
      }
      .card-body {
        padding: 24px 16px !important;
      }
      .header-content {
        padding: 30px 16px 15px 16px !important;
      }
    }
  </style>
</head>
<body style="background-color: #030303; margin: 0; padding: 40px 10px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Contenedor Principal Centrado con sombra y efecto Glassmorphism -->
  <table class="email-container" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #09090b; border: 1px solid #1f1f23; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8); border-collapse: separate; margin: 0 auto;">
    
    <!-- Línea Superior de Degradado Tecnológico -->
    <tr>
      <td style="background: linear-gradient(to right, #06b6d4, #7c3aed, #ec4899); height: 4px; padding: 0;"></td>
    </tr>
    
    <!-- Encabezado / Logo con diseño fluido -->
    <tr>
      <td class="header-content" style="padding: 45px 40px 20px 40px; text-align: center;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background-color: #141416; padding: 10px 22px; border-radius: 100px; border: 1px solid #27272a; text-align: center; display: inline-block;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Icono de marca simulado -->
                  <td style="padding-right: 10px; vertical-align: middle;">
                    <div style="background: linear-gradient(135deg, #06b6d4, #7c3aed); width: 22px; height: 22px; border-radius: 6px; display: inline-block; box-shadow: 0 4px 10px rgba(6,182,212,0.3);">
                      <div style="color: #ffffff; font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 900; line-height: 22px; text-align: center;">U</div>
                    </div>
                  </td>
                  <!-- Texto Logotipo -->
                  <td style="vertical-align: middle;">
                    <span style="font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 16px; letter-spacing: -0.3px; color: #ffffff;">
                      U-<span style="color: #06b6d4;">FORWARD</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <h1 style="color: #ffffff; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 24px; font-weight: 900; margin-top: 25px; margin-bottom: 6px; letter-spacing: -0.5px; line-height: 1.2;">
          ${title}
        </h1>
        <p style="color: #71717a; font-size: 13px; margin: 0; font-weight: 400; font-family: 'Inter', sans-serif; letter-spacing: 0.2px;">
          Notificación Oficial del Sistema
        </p>
      </td>
    </tr>
    
    <!-- Tarjeta de Detalles Principal -->
    <tr>
      <td class="card-body" style="padding: 10px 40px 30px 40px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0d0d0f; border: 1px solid #1a1a1e; border-radius: 16px; overflow: hidden; border-collapse: separate;">
          ${detailsHtml}
        </table>
      </td>
    </tr>

    <!-- Botón de Llamada a la Acción (CTA) Premium -->
    <tr>
      <td style="padding: 10px 40px 40px 40px; text-align: center;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 1px;">
              <a href="https://u-forward.vercel.app/dashboard" target="_blank" style="background-color: #09090b; border-radius: 11px; display: block; padding: 14px 28px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; letter-spacing: 0.5px; transition: background 0.2s;">
                IR AL PANEL DE CONTROL
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Pie de página corporativo -->
    <tr>
      <td style="padding: 30px 40px 45px 40px; text-align: center; border-top: 1px solid #1a1a1e; background-color: #070708;">
        <p style="color: #ffffff; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 12px; margin-bottom: 8px; letter-spacing: 0.5px;">
          U-<span style="color: #06b6d4;">FORWARD</span> ACADEMY
        </p>
        <p style="color: #52525b; font-size: 11px; margin: 0; font-family: 'Inter', sans-serif; line-height: 1.6; letter-spacing: 0.1px;">
          Este correo fue enviado de forma automática por el portal administrativo.<br>
          © 2026 U-Forward Academy. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function notifyAdmin(subject: string, html: string) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const transport = getTransport();

  if (!transport || !to) {
    console.log(`[ADMIN NOTIFICATION - email no configurado] ${subject}\n${html}`);
    return;
  }

  try {
    await transport.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    });

    // Registrar log de envío en Supabase
    try {
      const supabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await (supabase as any).from("EmailLog").insert({
        destinatario: to,
        asunto: subject,
      });
    } catch (dbErr) {
      console.error("Error al registrar log de email en Supabase:", dbErr);
    }
  } catch (err) {
    console.error("Error enviando email a admin:", err);
  }
}

export async function notifyAdminWithTemplate(subject: string, title: string, details: { label: string; value: string }[]) {
  const html = generateEmailTemplate(title, details);
  await notifyAdmin(subject, html);
}
