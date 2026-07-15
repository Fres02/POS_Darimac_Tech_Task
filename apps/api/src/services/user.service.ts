import { eq } from "drizzle-orm";
import type { CreateUserInput, User } from "@pos/shared";
import { HttpError } from "../lib/http-error";
import { supabaseAdmin } from "../lib/supabase";
import { db } from "../db/client";
import { profiles, authUsers } from "../db/schema";

export async function listUsers(): Promise<User[]> {
  const rows = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      role: profiles.role,
      active: profiles.active,
      email: authUsers.email,
    })
    .from(profiles)
    .innerJoin(authUsers, eq(profiles.id, authUsers.id));

  return rows.map((row) => ({ ...row, email: row.email ?? "" }));
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new HttpError(400, error?.message ?? "Failed to create user");
  }

  const [profile] = await db
    .insert(profiles)
    .values({ id: data.user.id, fullName: input.fullName, role: input.role, active: true })
    .returning();

  return {
    id: profile.id,
    fullName: profile.fullName,
    role: profile.role,
    active: profile.active,
    email: input.email,
  };
}
