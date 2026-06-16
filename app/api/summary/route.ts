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

    // Prevent Groq token limit errors
    const safeText = text.slice(0, 6000);

    const prompt = `
You are a study assistant.

Create a concise and well-structured summary of the PDF content below.

Requirements:
- Use headings
- Use bullet points
- Highlight important concepts
- Keep it short and study-friendly

PDF CONTENT:
${safeText}
`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 800,
      temperature: 0.3,
    });

    const summary =
      completion.choices[0]?.message?.content?.trim() ||
      "Could not generate summary.";

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error: any) {
    console.error("[summary/route] Error:", error);

    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}