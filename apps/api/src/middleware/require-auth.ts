import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import type { Role } from "@pos/shared";
import { supabaseAdmin } from "../lib/supabase";
import { HttpError } from "../lib/http-error";
import { db } from "../db/client";
import { profiles } from "../db/schema";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; fullName: string; email?: string };
    }
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing bearer token");
    }
    const token = authHeader.slice("Bearer ".length);

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw new HttpError(401, "Invalid or expired token");
    }

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, data.user.id),
    });
    if (!profile || !profile.active) {
      throw new HttpError(403, "Account is inactive");
    }

    req.user = {
      id: profile.id,
      role: profile.role,
      fullName: profile.fullName,
      email: data.user.email,
    };
    next();
  } catch (err) {
    next(err);
  }
};
