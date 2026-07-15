import type { CreateUserInput, UpdateUserInput, User } from "@pos/shared";
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

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const { user } = await apiFetch<{ user: User }>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return user;
}
