import type { NextApiHandler } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const handler: NextApiHandler = async (req, res) => {
  const email = (req.query.email as string) || "";
  if (!email) return res.status(400).json({ error: "email required ?email=" });

  const redirectTo = (process.env.NEXT_PUBLIC_SITE_URL || "") + "/auth/callback";
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ ok: true });
};

export default handler;
