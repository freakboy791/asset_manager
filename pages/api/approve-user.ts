// pages/api/approve-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type SelectedProfile = { email: string; role: string };

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rawToken = req.query.token;
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

    const rawUserId = req.query.user_id;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!token && !userId) {
      res.status(400).send("Missing token or user_id");
      return;
    }

    let data: SelectedProfile | null = null;

    if (token) {
      const { data: d, error } = await supabaseAdmin
        .from("profiles")
        .update({ approved: true, role: "manager", approval_token: null })
        .eq("approval_token", token)
        .select("email, role")
        .single();

      if (!error && d) {
        const { email, role } = d as SelectedProfile;
        data = { email, role };
      }
    } else if (userId) {
      const { data: d, error } = await supabaseAdmin
        .from("profiles")
        .update({ approved: true, role: "manager", approval_token: null })
        .eq("id", userId)
        .select("email, role")
        .single();

      if (!error && d) {
        const { email, role } = d as SelectedProfile;
        data = { email, role };
      }
    }

    if (!data) {
      res.status(400).send("Invalid, already approved, or not found.");
      return;
    }

    res.status(200).send(`✅ Approved ${data.email} as ${data.role}. You can close this tab.`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    res.status(500).send(msg);
  }
}
