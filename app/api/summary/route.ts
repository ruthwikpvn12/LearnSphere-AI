import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    console.log("[summary/route] text length:", text?.length ?? 0);

    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "No PDF content to summarize. Please upload a PDF first.",
      });
    }

    const prompt = `You are a study assistant. Summarize the following PDF content into a clear, structured study overview. Use bullet points for key concepts, and organize by topic if possible.

PDF CONTENT:
${text}

Provide a well-structured summary:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.3,
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() || "Could not generate summary.";

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error("[summary/route] Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}