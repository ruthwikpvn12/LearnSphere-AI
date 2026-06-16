import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, pdfText } = body;

    // ── DEBUG LOGS ── remove after confirming fix works
    console.log("[chat/route] message:", message);
    console.log("[chat/route] pdfText type:", typeof pdfText);
    console.log("[chat/route] pdfText length:", pdfText?.length ?? 0);
    console.log("[chat/route] pdfText preview:", pdfText?.slice(0, 200) ?? "(empty)");

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Message cannot be empty.",
      });
    }

    // Guard: no PDF uploaded yet
    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({
        success: true,
        answer:
          "⚠️ No PDF content found. Please upload a PDF on the Features page first, then return here to ask questions about it.",
      });
    }

    const prompt = `You are a study assistant. Use ONLY the PDF content provided below to answer the user's question accurately and concisely. If the answer is not found in the PDF, say: "This information is not covered in the uploaded PDF."

PDF CONTENT:
${pdfText}

USER QUESTION:
${message}

Answer:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.3,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() || "No response from model.";

    console.log("[chat/route] Answer preview:", answer.slice(0, 100));

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    console.error("[chat/route] Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}