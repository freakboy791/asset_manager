// pages/api/notify-new-user.ts
import type { NextApiHandler } from "next";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { sendEmail } from "../../utils/email"; // server-only helper

type ReqBody = {
  user_id?: string;
  email?: string;
};

const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { persistSession: false } }
);

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
    return;
  }

  const { user_id = "", email = "" } = (req.body ?? {}) as ReqBody;
  if (!user_id || !email) {
    res.status(400).json({ error: "Missing user_id/email" });
    return;
  }

  try {
    // Create one-time approval token and upsert a pending profile
    const approval_token = randomUUID();

    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user_id,
        email,
        role: "pending",
        approved: false,
        approval_token,
      });

    if (upsertError) {
      res.status(500).json({ error: upsertError.message });
      return;
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!siteUrl) {
      res.status(500).json({ error: "NEXT_PUBLIC_SITE_URL not set" });
      return;
    }
    if (!adminEmail) {
      res.status(500).json({ error: "ADMIN_EMAIL not set" });
      return;
    }

    const approveUrl = `${siteUrl}/api/approve-user?token=${encodeURIComponent(
      approval_token
    )}`;

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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    res.status(500).json({ error: message });
  }
};

export default handler;
