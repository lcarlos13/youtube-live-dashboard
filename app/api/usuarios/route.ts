import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const runtime = "nodejs";

// 🔐 Função para validar admin
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
// ========================
// ✅ GET - LISTAR USUÁRIOS
// ========================
//
export async function GET() {
  try {
    const auth = await validarAdmin();
    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.perfil,
        u.ativo,
        u.criado_em,
        p.nome AS pessoa_nome
      FROM usuarios u
      JOIN pessoas p ON p.id = u.pessoa_id
      ORDER BY u.id DESC
    `);

    return NextResponse.json(result.rows);

  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

//
// ========================
// ✅ POST - CRIAR USUÁRIO
// ========================
//
export async function POST(req: Request) {
  try {
    const auth = await validarAdmin();
    if ("error" in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { pessoaId, email, perfil } = await req.json();

    if (!pessoaId || !email || !perfil) {
      return NextResponse.json(
        { error: "Campos obrigatórios" },
        { status: 400 }
      );
    }

    // 🔎 Verificar se já existe usuário para essa pessoa
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE pessoa_id = $1",
      [pessoaId]
    );

    if (usuarioExistente.rows.length > 0) {
      return NextResponse.json(
        { error: "Essa pessoa já possui usuário" },
        { status: 400 }
      );
    }

    // 🔎 Verificar se email já está em uso
    const emailExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExistente.rows.length > 0) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash("123mudar", 10);

    await pool.query(
      `
      INSERT INTO usuarios (
        email,
        senha_hash,
        perfil,
        pessoa_id,
        precisa_trocar_senha,
        ativo,
        criado_em
      )
      VALUES ($1, $2, $3, $4, true, true, NOW())
      `,
      [email, hash, perfil, pessoaId]
    );

    return NextResponse.json({ success: true });

  } catch {
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}