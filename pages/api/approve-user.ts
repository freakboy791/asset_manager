// pages/api/approve-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const raw = req.query.token;
    const token = Array.isArray(raw) ? raw[0] : raw;
    if (!token) {
      res.status(400).send("Missing token");
      return;
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ approved: true, role: "manager", approval_token: null })
      .eq("approval_token", token)
      .select("email, role")
      .single();

    if (error || !data) {
      res.status(400).send("Invalid or used token");
      return;
    }

    res
      .status(200)
      .send(`✅ Approved ${data.email} as ${data.role}. You can close this tab.`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    res.status(500).send(msg);
  }
}

