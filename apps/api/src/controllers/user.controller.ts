import type { Request, Response, NextFunction } from "express";
import { createUserInputSchema, updateUserInputSchema, userSchema } from "@pos/shared";
import { createUser, listUsers, updateUser } from "../services/user.service";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await listUsers();
    res.json({ users: users.map((user) => userSchema.parse(user)) });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createUserInputSchema.parse(req.body);
    const user = await createUser(input);
    res.status(201).json({ user: userSchema.parse(user) });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateUserInputSchema.parse(req.body);
    const user = await updateUser(req.params.id, input, req.user!.id);
    res.json({ user: userSchema.parse(user) });
  } catch (err) {
    next(err);
  }
}
