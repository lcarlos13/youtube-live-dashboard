// app/api/pessoas/route.ts

import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    "SELECT id, nome FROM pessoas WHERE ativo = true ORDER BY nome"
  );

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const { nome } = await req.json();

  const result = await pool.query(
    `INSERT INTO pessoas (nome)
     VALUES ($1)
     ON CONFLICT (nome)
     DO UPDATE SET nome = EXCLUDED.nome
     RETURNING id`,
    [nome]
  );

  return NextResponse.json(result.rows[0]);
}