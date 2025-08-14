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

  try {
    // 1) Look up existing profile (if any)
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("profiles")
      .select("id, email, approved, role")
      .eq("id", user_id)
      .maybeSingle();

    if (selErr) {
      res.status(500).json({ error: selErr.message });
      return;
    }

    // If already approved, no need to email again
    if (existing?.approved) {
      res.status(200).json({ ok: true, note: "User already approved; no email sent" });
      return;
    }

    // 2) Always create a fresh one-time token
    const approval_token = randomUUID();

    // 3) Upsert (create if new, or refresh token if existing)
    //    Force role to 'pending' and approved=false until admin approves.
    const { error: upsertErr } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user_id,
        email,
        role: "pending",
        approved: false,
        approval_token,
      });

    if (upsertErr) {
      res.status(500).json({ error: upsertErr.message });
      return;
    }

    // 4) Email admin with the approval link
    const approveUrl = `${siteUrl}/api/approve-user?token=${encodeURIComponent(approval_token)}`;

    await sendEmail(
      adminEmail,
      "New user signup awaiting approval",
      `
        <p>A new user signed up and requires approval:</p>
        <ul>
          <li><b>Email:</b> ${email}</li>
          <li><b>User ID:</b> ${user_id}</li>
        </ul>
        <p>Approve this account:</p>
        <p><a href="${approveUrl}">${approveUrl}</a></p>
        <p>If this link has already been used or expires, a new token will be generated on the next signup attempt.</p>
      `
    );

    res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    res.status(500).json({ error: message });
  }
};

export default handler;
