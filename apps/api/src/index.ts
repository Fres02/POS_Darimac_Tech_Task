import express from "express";
import { SHARED_PACKAGE_NAME } from "@pos/shared";

const app = express();
const port = process.env.PORT ?? 4000;

app.get("/", (_req, res) => {
  res.json({ status: "ok", uses: SHARED_PACKAGE_NAME });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
