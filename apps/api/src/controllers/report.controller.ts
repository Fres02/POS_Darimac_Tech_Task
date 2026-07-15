import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/http-error";
import { getColomboDateString } from "../lib/colombo-time";
import { resendDailyReport } from "../services/report.service";

export async function resendToday(req: Request, res: Response, next: NextFunction) {
  try {
    const adminEmail = req.user!.email;
    if (!adminEmail) {
      throw new HttpError(400, "Admin account has no email on file");
    }
    const reportDate = getColomboDateString(new Date());
    await resendDailyReport(reportDate, adminEmail);
    res.json({ reportDate });
  } catch (err) {
    next(err);
  }
}
