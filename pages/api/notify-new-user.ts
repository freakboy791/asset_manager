// pages/api/notify-new-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY!;
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: "Asset Tracker <noreply@yourdomain.com>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Resend error: ${txt}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") return res.status(405).end();

    const { user_id, email } = req.body as { user_id: string; email: string };
    if (!user_id || !email) return res.status(400).json({ error: "Missing user_id/email" });

    // generate one-time approval token
    const approval_token = crypto.randomUUID();

    // upsert profile with pending/approved=false
    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: user_id, email, role: "pending", approved: false, approval_token });

    if (upsertError) throw upsertError;

    const adminEmail = process.env.ADMIN_EMAIL!;
    const approveUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/approve-user?token=${encodeURIComponent(approval_token)}`;

    await sendEmail(
      adminEmail,
      "New user signup awaiting approval",
      `
        <p>A new user signed up:</p>
        <ul>
          <li><b>Email:</b> ${email}</li>
          <li><b>User ID:</b> ${user_id}</li>
        </ul>
        <p>Approve this account:</p>
        <p><a href="${approveUrl}">${approveUrl}</a></p>
      `
    );

    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Server error" });
  }
}
