import { eq } from "drizzle-orm";
import { supabaseAnon } from "../lib/supabase";
import { HttpError } from "../lib/http-error";
import { db } from "../db/client";
import { profiles } from "../db/schema";

export async function loginWithPassword(email: string, password: string) {
  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, data.user.id),
  });

  if (!profile || !profile.active) {
    throw new HttpError(403, "Account is inactive");
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? 0,
    profile,
  };
}
