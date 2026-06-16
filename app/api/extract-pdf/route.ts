import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("pdf") as File | null;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No file uploaded. Please select a PDF file.",
      });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({
        success: false,
        error: "Only PDF files are supported.",
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[extract-pdf] File received:", file.name, "| Size:", buffer.length, "bytes");

    // require() is INSIDE the function — this is intentional
    // It avoids the ESM/CJS conflict that causes ts(1202)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(buffer);

    console.log("[extract-pdf] Extracted text length:", parsed.text?.length ?? 0);
    console.log("[extract-pdf] Pages:", parsed.numpages);
    console.log("[extract-pdf] Text preview:", parsed.text?.slice(0, 300));

    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "This PDF appears to be image-based or scanned. Only text-based PDFs can be extracted.",
      });
    }

    return NextResponse.json({
      success: true,
      text: parsed.text,
      fileName: file.name,
      pages: parsed.numpages,
    });
  } catch (error: any) {
    console.error("[extract-pdf] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to parse PDF: " + error.message,
    });
  }
}