import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { title, content } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert academic note summarizer. Summarize the following study note in a structured, concise markdown format.
Include: Key Concepts, Main Points (bullet list), and a 2-sentence conclusion.

Title: ${title}

Content:
${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return NextResponse.json({ summary: response.text });
  } catch (err) {
    console.error("Summarize API error:", err);
    return NextResponse.json({ error: "Failed to summarize note" }, { status: 500 });
  }
}
