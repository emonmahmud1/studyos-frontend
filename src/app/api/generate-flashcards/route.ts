import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { topic, quantity = 4 } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate ${quantity} high-quality academic flashcards about: "${topic}".
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{"cards": [{"question": "...", "answer": "..."}, ...]}

Make questions specific and answers detailed but concise. Focus on key concepts, definitions, and relationships.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Invalid response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Flashcard generation error:", err);
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 });
  }
}
