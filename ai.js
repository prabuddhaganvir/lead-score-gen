import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function classifyLead(lead, offer) {
  const prompt = `
You are a lead qualification assistant.

Product Offer:
Name: ${offer.name}
Value Props: ${offer.value_props.join(", ")}
Ideal Use Cases: ${offer.ideal_use_cases.join(", ")}

Lead Details:
Name: ${lead.name}
Role: ${lead.role}
Company: ${lead.company}
Industry: ${lead.industry}
Location: ${lead.location}
LinkedIn Bio: ${lead.linkedin_bio}

Classify this lead's buying intent as High, Medium, or Low. Explain in 1-2 sentences why.
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    // Extract AI text
    const text = response.data.candidates[0].content.parts[0].text;

    let intent = "Low";
    if (text.toLowerCase().includes("high")) intent = "High";
    else if (text.toLowerCase().includes("medium")) intent = "Medium";

    return { intent, reasoning: text.trim() };
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return { intent: "Low", reasoning: "Error in AI classification." };
  }
}
