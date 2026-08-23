import "server-only";
import { site } from "./site";

type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

/**
 * Invio email.
 * Se RESEND_API_KEY non è impostata il messaggio viene solo scritto nei log
 * del server: il sito resta pienamente utilizzabile in modalità di prova.
 */
export async function sendEmail(mail: Mail): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || `${site.name} <${site.email}>`;

  if (!apiKey) {
    console.info(
      `[email:demo] destinatario=${mail.to} oggetto="${mail.subject}"\n${mail.text}\n--- fine messaggio (nessuna chiave RESEND_API_KEY configurata) ---`,
    );
    return { sent: false, reason: "demo" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
        reply_to: mail.replyTo,
      }),
    });
    if (!res.ok) {
      console.error("[email] invio fallito:", res.status, await res.text());
      return { sent: false, reason: `http_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] errore di rete:", err);
    return { sent: false, reason: "network" };
  }
}
