import { eq } from "drizzle-orm";
import { supabaseAnon } from "../lib/supabase";
import { HttpError } from "../lib/http-error";
import { db } from "../db/client";
import { profiles, authUsers } from "../db/schema";
import { getColomboDateString } from "../lib/colombo-time";
import { ensureDailyReportSent } from "./report.service";
import { logger } from "../logger";

const LOCKOUT_THRESHOLD = 5;
const LOCKED_MESSAGE =
  "Account locked after repeated failed login attempts. Ask an admin to unlock it.";

export async function loginWithPassword(email: string, password: string) {
  const [existingProfile] = await db
    .select({
      id: profiles.id,
      locked: profiles.locked,
      failedLoginAttempts: profiles.failedLoginAttempts,
    })
    .from(profiles)
    .innerJoin(authUsers, eq(profiles.id, authUsers.id))
    .where(eq(authUsers.email, email));

  if (existingProfile?.locked) {
    throw new HttpError(403, LOCKED_MESSAGE);
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    if (existingProfile) {
      const attempts = existingProfile.failedLoginAttempts + 1;
      const locked = attempts >= LOCKOUT_THRESHOLD;
      await db
        .update(profiles)
        .set({ failedLoginAttempts: attempts, locked })
        .where(eq(profiles.id, existingProfile.id));
      if (locked) {
        throw new HttpError(403, LOCKED_MESSAGE);
      }
    }
    throw new HttpError(401, "Invalid email or password");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, data.user.id),
  });

  if (!profile || !profile.active) {
    throw new HttpError(403, "Account is inactive");
  }

  if (profile.failedLoginAttempts > 0) {
    await db.update(profiles).set({ failedLoginAttempts: 0 }).where(eq(profiles.id, profile.id));
  }

  if (profile.role === "admin" && data.user.email) {
    const reportDate = getColomboDateString(new Date());
    ensureDailyReportSent(reportDate, data.user.email).catch((err) => {
      logger.error({ err }, "Failed to send daily sales report email");
    });
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? 0,
    profile,
  };
}
