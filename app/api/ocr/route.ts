import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const runtime = "nodejs";

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

    const { data } = await Tesseract.recognize(
      buffer,
      "por",
      {
        logger: (m) => console.log(m),
      }
    );

    return NextResponse.json({ text: data.text });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao processar OCR" },
      { status: 500 }
    );
  }
}