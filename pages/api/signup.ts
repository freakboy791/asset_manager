// pages/api/signup.ts
import type { NextApiHandler } from "next";

const handler: NextApiHandler = (_req, res) => {
  res
    .status(405)
    .json({ error: "Use client-side supabase.auth.signUp with emailRedirectTo." });
};

export default handler;
