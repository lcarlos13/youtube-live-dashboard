import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: "admin" | "user";
      pessoa_id: number;
    };
  } catch {
    return null;
  }
}

//
// ==========================
// ✅ GET - listar funções da pessoa
// ==========================
export async function GET() {
  const user = await getUserFromToken();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const result = await pool.query(`
    SELECT 
      pf.id,
      p.nome AS pessoa_nome,
      f.nome AS funcao_nome,
      pf.nivel
    FROM pessoa_funcoes pf
    JOIN pessoas p ON p.id = pf.pessoa_id
    JOIN funcoes f ON f.id = pf.funcao_id
    ORDER BY p.nome;
  `);

  return NextResponse.json(result.rows);
}

//
// ==========================
// ✅ POST - adicionar função
// ==========================
export async function POST(req: Request) {
    const user = await getUserFromToken();
  
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (user.role === "admin") {

      const { pessoaId, funcaoId, nivel } = await req.json();

      if (!pessoaId || !funcaoId)
        return NextResponse.json(
          { error: "Campos obrigatórios" },
          { status: 400 }
        );

      await pool.query(
        `
        INSERT INTO pessoa_funcoes (pessoa_id, funcao_id, nivel)
        VALUES ($1, $2, $3)
        `,
        [pessoaId, funcaoId, nivel || 1]
      );

      return NextResponse.json({ success: true });
    }     
}