// utils/email.ts
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.FROM_EMAIL; // e.g. noreply@chrismatt.com

if (!apiKey) {
  // Don't throw at import time in prod; API routes will check again.
  console.warn("RESEND_API_KEY is not set");
}
if (!from) {
  console.warn("FROM_EMAIL is not set");
}

const resend = apiKey ? new Resend(apiKey) : null;

/** Send an email via Resend using your verified domain. */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) throw new Error("RESEND_API_KEY not configured");
  if (!from) throw new Error("FROM_EMAIL not configured");

  const res = await resend.emails.send({
    from: `Asset Manager <${from}>`,
    to,
    subject,
    html,
  });

  return res;
}
