const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

const analyzeCall = async (transcript) => {
  try {
    console.log("Sending transcript to Gemini...");

    const prompt = `
    You are a QA call analysis AI expert.
    Analyze this customer support call transcript.
    I want you to generate timeline emotions of every 30 seconds.
    And return the following analysis. Make sure to return ONLY valid JSON.

{
  "summary": {
    "overview": "",
    "customerIssue": "",
    "resolution": "",
    "escalation": false
  },

  "scorecard": {
    "empathy": 0,
    "professionalism": 0,
    "communication": 0,
    "resolutionQuality": 0,
    "overall": 0,
    "feedback": ""
  },

  "emotionTimeline": [
    {
      "speaker": "",
      "emotion": "",
      "intensity": 0,
      "timestamp": 0
    }
  ]
}

Transcript:
${transcript}
`;

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    console.log("RAW GEMINI RESPONSE:");

    console.log(response);

    // EXTRACT JSON SAFELY
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    console.log("Parsed Gemini JSON:");

    console.log(parsed);

    return parsed;
  } catch (error) {
    console.error("Gemini Error:", error.message);

    throw error;
  }
};

module.exports = analyzeCall;

