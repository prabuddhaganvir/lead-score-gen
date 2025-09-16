import express from "express";
import Offer from "../models/Offer.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
