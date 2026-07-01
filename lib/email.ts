import nodemailer from "nodemailer";

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
  const detailsHtml = details.map(d => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #1f1f23; font-size: 14px; color: #a1a1aa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <strong>${d.label}:</strong>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #1f1f23; font-size: 14px; color: #ffffff; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        ${d.value}
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="background-color: #000000; margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #09090b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-collapse: separate;">
    <!-- Header Decorator -->
    <tr>
      <td style="background: linear-gradient(to right, #06b6d4, #7c3aed); height: 4px; padding: 0;"></td>
    </tr>
    <!-- Header Content -->
    <tr>
      <td style="padding: 40px 40px 20px 40px; text-align: center;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="background-color: #18181b; padding: 10px 24px; border-radius: 9999px; border: 1px solid #27272a; text-align: center;">
              <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; color: #ffffff;">
                U-<span style="color: #06b6d4;">FORWARD</span>
              </span>
            </td>
          </tr>
        </table>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 30px; margin-bottom: 5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: -0.5px;">
          ${title}
        </h1>
        <p style="color: #71717a; font-size: 13px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          Notificación automática del sistema
        </p>
      </td>
    </tr>
    
    <!-- Details Card -->
    <tr>
      <td style="padding: 20px 40px 40px 40px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #121214; border: 1px solid #1c1c1f; border-radius: 12px; padding: 24px; border-collapse: separate;">
          ${detailsHtml}
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 30px 40px 40px 40px; text-align: center; border-top: 1px solid #1f1f23; background-color: #0c0c0e;">
        <p style="color: #52525b; font-size: 11px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
          Este es un correo automático generado por el sistema administrativo de <strong>U-Forward Academy</strong>.<br>
          Por favor, no respondas directamente a este mensaje.
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
  } catch (err) {
    console.error("Error enviando email a admin:", err);
  }
}

export async function notifyAdminWithTemplate(subject: string, title: string, details: { label: string; value: string }[]) {
  const html = generateEmailTemplate(title, details);
  await notifyAdmin(subject, html);
}
