import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
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

//
// ==========================
// 🔁 PATCH - ALTERAR STATUS
// ==========================
//
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

    const { id } = await params; // ✅ NEXT 15
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const { ativo } = await req.json();

    await pool.query(
      "UPDATE usuarios SET ativo = $1 WHERE id = $2",
      [ativo, userId]
    );

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}

//
// ======================
// 🗑️ DELETE - EXCLUIR
// ======================
//
export async function DELETE(
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

    const { id } = await params; // ✅ NEXT 15
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    await pool.query("DELETE FROM usuarios WHERE id = $1", [userId]);

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir usuário" },
      { status: 500 }
    );
  }
}