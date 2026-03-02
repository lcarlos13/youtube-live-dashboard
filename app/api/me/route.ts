// app/api/me/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: "admin" | "user";
      pessoa_id: number;
    };

    return NextResponse.json(decoded);
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}