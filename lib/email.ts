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
