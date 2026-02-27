import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { novaSenha } = await req.json();

    if (!novaSenha) {
      return NextResponse.json(
        { error: "Senha obrigatória" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    const hash = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      `
      UPDATE usuarios
      SET senha_hash = $1,
          precisa_trocar_senha = false,
          atualizado_em = NOW()
      WHERE id = $2
      `,
      [hash, decoded.id]
    );

    // ✅ GERAR NOVO TOKEN
    const novoToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        perfil: decoded.perfil,
        precisaTrocarSenha: false, // agora false
      },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );

    const response = NextResponse.json({ success: true });

    // ✅ Atualizar cookie
    response.cookies.set("auth", novoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}