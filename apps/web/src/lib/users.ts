import type { CreateUserInput, User } from "@pos/shared";
import { apiFetch } from "./api";

export async function fetchUsers(): Promise<User[]> {
  const { users } = await apiFetch<{ users: User[] }>("/api/users");
  return users;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { user } = await apiFetch<{ user: User }>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return user;
}
