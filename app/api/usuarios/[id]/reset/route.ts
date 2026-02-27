import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// 🔐 validar admin
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await validarAdmin();
    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    // 🔒 nova senha padrão
    const novaSenhaHash = await bcrypt.hash("123mudar", 10);

    await pool.query(
      `
      UPDATE usuarios
      SET senha_hash = $1,
          precisa_trocar_senha = true
      WHERE id = $2
      `,
      [novaSenhaHash, userId]
    );

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Erro ao resetar senha" },
      { status: 500 }
    );
  }
}