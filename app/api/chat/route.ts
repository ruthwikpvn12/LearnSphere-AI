import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, pdfText } = body;

    console.log("[chat/route] message:", message);
    console.log("[chat/route] pdfText length:", pdfText?.length ?? 0);

    if (!message || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Message cannot be empty.",
      });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({
        success: true,
        answer:
          "⚠️ No PDF content found. Please upload a PDF first.",
      });
    }

    // Prevent Groq token limit errors
    const safeText = pdfText.slice(0, 4000);

    const prompt = `
You are a study assistant.

Answer the user's question ONLY using the PDF content below.

Rules:
- Be concise.
- If the answer is not in the PDF, say:
  "This information is not covered in the uploaded PDF."

PDF CONTENT:
${safeText}

QUESTION:
${message}

ANSWER:
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 500,
      temperature: 0.3,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ||
      "No response from model.";

    return NextResponse.json({
      success: true,
      answer,
    });
  } catch (error: any) {
    console.error("[chat/route] Error:", error);

    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error",
    });
  }
}