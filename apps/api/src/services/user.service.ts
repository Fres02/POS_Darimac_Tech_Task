import { and, eq, ne } from "drizzle-orm";
import type { CreateUserInput, UpdateUserInput, User } from "@pos/shared";
import { HttpError } from "../lib/http-error";
import { supabaseAdmin } from "../lib/supabase";
import { db } from "../db/client";
import { profiles, authUsers } from "../db/schema";

async function getUserRow(id: string) {
  const [row] = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      role: profiles.role,
      active: profiles.active,
      locked: profiles.locked,
      email: authUsers.email,
    })
    .from(profiles)
    .innerJoin(authUsers, eq(profiles.id, authUsers.id))
    .where(eq(profiles.id, id));
  return row ? { ...row, email: row.email ?? "" } : undefined;
}

export async function listUsers(): Promise<User[]> {
  const rows = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      role: profiles.role,
      active: profiles.active,
      locked: profiles.locked,
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
    locked: profile.locked,
    email: input.email,
  };
}

export async function updateUser(
  targetId: string,
  input: UpdateUserInput,
  currentUserId: string,
): Promise<User> {
  if (targetId === currentUserId) {
    throw new HttpError(400, "You cannot change your own role or active status");
  }

  const target = await db.query.profiles.findFirst({ where: eq(profiles.id, targetId) });
  if (!target) {
    throw new HttpError(404, "User not found");
  }

  const resultRole = input.role ?? target.role;
  const resultActive = input.active ?? target.active;
  const losesActiveAdmin = target.role === "admin" && target.active;
  const staysActiveAdmin = resultRole === "admin" && resultActive;

  if (losesActiveAdmin && !staysActiveAdmin) {
    const otherActiveAdmins = await db.$count(
      profiles,
      and(eq(profiles.role, "admin"), eq(profiles.active, true), ne(profiles.id, targetId)),
    );
    if (otherActiveAdmins === 0) {
      throw new HttpError(400, "Cannot remove the last active admin");
    }
  }

  await db
    .update(profiles)
    .set({
      ...(input.role !== undefined && { role: input.role }),
      ...(input.active !== undefined && { active: input.active }),
      // Unlocking also clears the failed-attempt counter, so the account
      // doesn't start back at the lockout threshold on its next bad attempt.
      ...(input.locked !== undefined && {
        locked: input.locked,
        ...(!input.locked && { failedLoginAttempts: 0 }),
      }),
    })
    .where(eq(profiles.id, targetId));

  const updated = await getUserRow(targetId);
  if (!updated) {
    throw new HttpError(404, "User not found");
  }
  return updated;
}
