// pages/api/approve-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-only key
);

// GET /api/approve-user?token=abc
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = String(req.query.token || "");
    if (!token) return res.status(400).send("Missing token");

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ approved: true, role: "manager", approval_token: null })
      .eq("approval_token", token)
      .select("email, role")
      .single();

    if (error || !data) return res.status(400).send("Invalid or used token");

    res
      .status(200)
      .send(`✅ Approved ${data.email} as ${data.role}. You can close this tab.`);
  } catch (e: any) {
    res.status(500).send(e.message || "Server error");
  }
}

