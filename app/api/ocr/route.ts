// app/api/ocr/route.ts

import { NextRequest, NextResponse } from "next/server";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient({
  credentials: JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string
  ),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const [result] = await client.textDetection(buffer);

    const text = result.textAnnotations?.[0]?.description || "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Erro OCR:", error);
    return NextResponse.json(
      { error: "Erro ao processar OCR" },
      { status: 500 }
    );
  }
}