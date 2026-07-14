import express from "express";
import { SHARED_PACKAGE_NAME } from "@pos/shared";
import { env } from "./env";

const app = express();

app.get("/", (_req, res) => {
  res.json({ status: "ok", uses: SHARED_PACKAGE_NAME });
});

app.listen(env.PORT, () => {
  console.log(`API listening on port ${env.PORT} (${env.NODE_ENV})`);
});
