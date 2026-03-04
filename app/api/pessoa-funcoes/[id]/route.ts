import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function validarAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) return { error: "Não autenticado", status: 401 };

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    if (decoded.perfil !== "admin") {
      return { error: "Sem permissão", status: 403 };
    }

    return { decoded };
  } catch {
    return { error: "Token inválido", status: 401 };
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await validarAdmin();
    if ("error" in auth)
      return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;

    await pool.query(
      "DELETE FROM pessoa_funcoes WHERE id = $1",
      [Number(id)]
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao remover função" },
      { status: 500 }
    );
  }
}