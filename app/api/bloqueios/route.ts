import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  let query = `
    SELECT 
      b.id,
      b.data,
      b.horario_inicio,
      b.horario_fim,
      b.motivo,
      p.nome AS nome_pessoa,
      p.id AS pessoa_id
    FROM bloqueios b
    JOIN pessoas p ON p.id = b.pessoa_id
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramIndex = 1;

  if (inicio) {
    query += ` AND b.data >= $${paramIndex}`;
    values.push(inicio);
    paramIndex++;
  }

  if (fim) {
    query += ` AND b.data <= $${paramIndex}`;
    values.push(fim);
    paramIndex++;
  }

  query += `
    ORDER BY b.data DESC, b.horario_inicio
  `;

  const result = await pool.query(query, values);

  return NextResponse.json(result.rows);
}


export async function POST(req: NextRequest) {
  const { pessoa_id, data, horario_inicio, horario_fim, motivo } =
    await req.json();

  if (!pessoa_id || !data) {
    return NextResponse.json(
      { error: "Pessoa e data são obrigatórios" },
      { status: 400 }
    );
  }

  const result = await pool.query(
    `
    INSERT INTO bloqueios 
      (pessoa_id, data, horario_inicio, horario_fim, motivo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      pessoa_id,
      data,
      horario_inicio || null,
      horario_fim || null,
      motivo || null,
    ]
  );

  return NextResponse.json(result.rows[0]);
}


export async function DELETE(req: NextRequest) {
  const user = await getUserFromToken();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID obrigatório" },
      { status: 400 }
    );
  }

  // 👑 Se for admin → pode deletar direto
  if (user.role === "admin") {
    await pool.query(`DELETE FROM bloqueios WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  }

  // 👤 Se for user → precisa verificar se o bloqueio é dele
  const check = await pool.query(
    `SELECT pessoa_id FROM bloqueios WHERE id = $1`,
    [id]
  );

  if (check.rows.length === 0) {
    return NextResponse.json(
      { error: "Bloqueio não encontrado" },
      { status: 404 }
    );
  }

  if (check.rows[0].pessoa_id !== user.pessoa_id) {
    return NextResponse.json(
      { error: "Sem permissão para excluir este bloqueio" },
      { status: 403 }
    );
  }

  await pool.query(`DELETE FROM bloqueios WHERE id = $1`, [id]);

  return NextResponse.json({ success: true });
}