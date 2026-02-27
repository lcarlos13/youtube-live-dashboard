import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, senha } = await req.json();

    if (!email || !senha) {
      return NextResponse.json(
        { error: "Email e senha obrigatórios" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM usuarios WHERE email = $1 AND ativo = true`,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha_hash
    );

    if (!senhaValida) {
      return NextResponse.json(
        { error: "Senha inválida" },
        { status: 401 }
      );
    }

    // Criar token
    const token = jwt.sign(
    {
      id: usuario.id,
      pessoa_id: usuario.pessoa_id,
      perfil: usuario.perfil,
      precisaTrocarSenha: usuario.precisa_trocar_senha
    },
    process.env.JWT_SECRET!,
    { expiresIn: "8h" }
  );

    const response = NextResponse.json({
      success: true,
      precisaTrocarSenha: usuario.precisa_trocar_senha,
    });

    response.cookies.set("auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}