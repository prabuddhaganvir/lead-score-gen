import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import Lead from "../models/Leads.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      await Lead.insertMany(results);
      fs.unlinkSync(req.file.path);
      res.json({ message: "Leads uploaded", count: results.length });
    });
});

export default router;
