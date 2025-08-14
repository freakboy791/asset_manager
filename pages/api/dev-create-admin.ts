// pages/api/dev-create-admin.ts
import type { NextApiHandler } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { persistSession: false } }
);

/**
 * One-time bootstrap endpoint to create an admin user + profile.
 * Guarded by ADMIN_SETUP_TOKEN. DELETE THIS FILE AFTER SUCCESS.
 *
 * Usage (GET):
 * /api/dev-create-admin?email=you@chrismatt.com&password=TempPass123!&token=YOUR_ADMIN_SETUP_TOKEN
 */
const handler: NextApiHandler = async (req, res) => {
  try {
    const { email, password, token } = req.query as {
      email?: string;
      password?: string;
      token?: string;
    };

    if (!token || token !== process.env.ADMIN_SETUP_TOKEN) {
      res.status(401).json({ error: "Invalid or missing token" });
      return;
    }
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password" });
      return;
    }

    // 1) Create (or fetch) the auth user via admin API.
    //    This bypasses "signups disabled" in GoTrue.
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // mark as verified
    });

    if (createErr) {
      // If user exists, fetch it; otherwise return error
      if (createErr.message?.toLowerCase().includes("already")) {
        const { data: existing, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
        if (listErr) return res.status(500).json({ error: listErr.message });
        const user = existing.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (!user) return res.status(500).json({ error: "User appears to exist but cannot be found" });
        // proceed with that user
        await upsertProfile(user.id, email);
        return res.status(200).json({ ok: true, user_id: user.id, note: "User existed; profile upserted as admin" });
      }
      return res.status(500).json({ error: createErr.message });
    }

    const userId = created.user?.id;
    if (!userId) return res.status(500).json({ error: "No user id returned" });

    // 2) Upsert admin profile (approved = true)
    await upsertProfile(userId, email);

    res.status(200).json({ ok: true, user_id: userId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    res.status(500).json({ error: msg });
  }
};

async function upsertProfile(userId: string, email: string) {
  const { error: upsertErr } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: userId,
      email,
      role: "admin",
      approved: true,
      approval_token: null,
    });
  if (upsertErr) throw upsertErr;
}

export default handler;
