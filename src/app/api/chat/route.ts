import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured. Please add it to your .env.local file." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an expert AI Study Coach inside a student productivity platform called Study OS. 
You help students with study strategies, time management, exam preparation, and academic questions.
Keep responses concise, encouraging, and actionable. Use markdown formatting when helpful.`;

    const historyMessages = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === "coach" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.0-flash",
      config: { systemInstruction },
      history: historyMessages,
    });

    const response = await chat.sendMessage({ message });
    return NextResponse.json({ reply: response.text });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
