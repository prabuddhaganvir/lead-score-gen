import express from "express";
import Offer from "../models/Offer.js";
import Lead from "../models/Leads.js";
import { classifyLead } from "../utilis/ai.js";

const router = express.Router();

// POST /score
router.post("/", async (req, res) => {
  try {
    const offer = await Offer.findOne().sort({ createdAt: -1 });
    if (!offer) return res.status(400).json({ error: "Offer not found" });

    const leads = await Lead.find();

    for (let lead of leads) {
      let rule_score = 0;

      // Role relevance
      const decisionMakerRoles = ["CEO", "Founder", "Head", "Director"];
      const influencerRoles = ["Manager", "Consultant", "Advisor"];

      if (decisionMakerRoles.some(r => lead.role.toLowerCase().includes(r.toLowerCase()))) {
        rule_score += 20;
      } else if (influencerRoles.some(r => lead.role.toLowerCase().includes(r.toLowerCase()))) {
        rule_score += 10;
      }

      // Industry match
      if (offer.ideal_use_cases.some(useCase => lead.industry.toLowerCase().includes(useCase.toLowerCase()))) {
        rule_score += 20;
      } else if (offer.ideal_use_cases.some(useCase => useCase.toLowerCase().includes("b2b") || useCase.toLowerCase().includes("saas"))) {
        rule_score += 10;
      }

      // Data completeness
      if (lead.name && lead.role && lead.company && lead.industry && lead.location && lead.linkedin_bio) {
        rule_score += 10;
      }

      // AI layer
      const aiResult = await classifyLead(lead, offer);
      let ai_points = 10;
      if (aiResult.intent === "High") ai_points = 50;
      else if (aiResult.intent === "Medium") ai_points = 30;

      lead.score = rule_score + ai_points;
      lead.intent = aiResult.intent;
      lead.reasoning = aiResult.reasoning;

      await lead.save();
    }

    res.json({ message: "Scoring completed", count: leads.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /results
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().select("-__v -createdAt -updatedAt");
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
