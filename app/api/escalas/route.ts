import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    // body será um array
    const dados = body;

    await client.query("BEGIN");

    for (const item of dados) {
      const { data, horario, funcao, nome } = item;

      // 1️⃣ tenta encontrar escala existente
      let escalaResult = await client.query(
        `SELECT id FROM escalas 
         WHERE data = $1 AND horario = $2`,
        [data, horario]
      );

      let escalaId;

      if (escalaResult.rows.length === 0) {
        // 2️⃣ cria nova escala
        const insertEscala = await client.query(
          `INSERT INTO escalas (data, horario)
           VALUES ($1, $2)
           RETURNING id`,
          [data, horario]
        );

        escalaId = insertEscala.rows[0].id;
      } else {
        escalaId = escalaResult.rows[0].id;
      }

      // 3️⃣ insere participante
      await client.query(
        `INSERT INTO escala_participantes (escala_id, funcao, nome_pessoa)
         VALUES ($1, $2, $3)`,
        [escalaId, funcao, nome]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const dataInicio = searchParams.get("inicio");
  const dataFim = searchParams.get("fim");

  const result = await pool.query(
    `
    SELECT 
      e.id as escala_id,
      e.data,
      e.horario,
      p.id as participante_id,
      p.nome_pessoa,
      p.funcao
    FROM escalas e
    JOIN escala_participantes p 
      ON p.escala_id = e.id
    WHERE e.data BETWEEN $1 AND $2
    ORDER BY e.data, e.horario
    `,
    [dataInicio, dataFim]
  );

  return NextResponse.json(result.rows);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const escalaId = searchParams.get("id");

  if (!escalaId) {
    return NextResponse.json(
      { error: "ID não informado" },
      { status: 400 }
    );
  }

  await pool.query(
    "DELETE FROM escalas WHERE id = $1",
    [escalaId]
  );

  return NextResponse.json({ success: true });
}