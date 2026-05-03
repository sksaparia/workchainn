import { Router } from "express";
import path from "path";
import fs from "fs";

const router = Router();

router.get("/download-source", (req, res) => {
  const zipPath = path.resolve("/home/runner/workspace/workchain-source.zip");
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: "File not found. Please regenerate the zip." });
  }
  res.setHeader("Content-Disposition", 'attachment; filename="workchain-source.zip"');
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Length", fs.statSync(zipPath).size);
  fs.createReadStream(zipPath).pipe(res);
});

export default router;
