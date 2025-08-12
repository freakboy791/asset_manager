// pages/api/approve-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only
);

// GET /api/approve-user?token=abc123
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = String(req.query.token || "");
    if (!token) return res.status(400).send("Missing token");

    // Approve the user with this token, set role (you can change default here)
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ approved: true, role: "manager", approval_token: null })
      .eq("approval_token", token)
      .select("email, role")
      .single();

    if (error || !data) return res.status(400).send("Invalid or used token");

    res.status(200).send(`✅ Approved ${data.email} as ${data.role}`);
  } catch (e: any) {
    res.status(500).send(e.message || "Server error");
  }
}
