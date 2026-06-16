import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    console.log("[quiz/route] text length:", text?.length ?? 0);

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "No PDF content to generate a quiz from. Please upload a PDF first.",
      });
    }

    const prompt = `You are a study assistant. Generate 5 multiple-choice quiz questions based on the PDF content below. 

Format each question exactly like this:
Q1. [Question text]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Answer: [Correct letter]

PDF CONTENT:
${text}

Generate 5 quiz questions:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.5,
    });

    const quiz =
      completion.choices[0]?.message?.content?.trim() || "Could not generate quiz.";

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    console.error("[quiz/route] Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}