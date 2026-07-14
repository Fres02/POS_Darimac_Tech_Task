import { createClient } from "@supabase/supabase-js";
import { env } from "../env";

const clientOptions = { auth: { autoRefreshToken: false, persistSession: false } };

// Elevated privileges — bypasses RLS. Server-side only: user admin, seeding.
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  clientOptions,
);

// Same privilege level as an anonymous browser client — used for operations
// (like password sign-in) that should carry no more trust than the end user.
export const supabaseAnon = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_PUBLISHABLE_KEY,
  clientOptions,
);
