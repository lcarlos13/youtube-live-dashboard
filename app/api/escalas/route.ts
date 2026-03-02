import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const dados = await req.json();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 🔥 Agrupar por data + horario
    const grupos: Record<string, any[]> = {};

    for (const item of dados) {
      const chave = `${item.data}_${item.horario}`;

      if (!grupos[chave]) {
        grupos[chave] = [];
      }

      grupos[chave].push(item);
    }

    // 🔥 Para cada grupo, criar uma escala
    for (const chave in grupos) {
      const itens = grupos[chave];
      const { data, horario } = itens[0];

      const escalaResult = await client.query(
        `
        INSERT INTO escalas (data, horario)
        VALUES ($1, $2)
        RETURNING id
        `,
        [data, horario]
      );

      const escalaId = escalaResult.rows[0].id;

      // 🔥 Inserir participantes desse grupo
      for (const item of itens) {
        const { pessoa_id, funcao } = item;

        // Verificar bloqueio
        const bloqueio = await client.query(
          `
          SELECT *
          FROM bloqueios
          WHERE pessoa_id = $1
            AND data = $2
            AND (
              (horario_inicio IS NULL AND horario_fim IS NULL)
              OR
              ($3 BETWEEN horario_inicio AND horario_fim)
            )
          `,
          [pessoa_id, data, horario]
        );

        if (bloqueio.rows.length > 0) {
          await client.query("ROLLBACK");
          return NextResponse.json(
            {
              error: `Pessoa ${pessoa_id} bloqueada para ${data} às ${horario}`,
            },
            { status: 400 }
          );
        }

        await client.query(
          `
          INSERT INTO escala_participantes
            (escala_id, pessoa_id, funcao)
          VALUES ($1, $2, $3)
          `,
          [escalaId, pessoa_id, funcao]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({ success: true });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar escala" },
      { status: 500 }
    );
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
      ep.id as participante_id,
      p.id as pessoa_id,
      p.nome as nome_pessoa,
      ep.funcao
    FROM escalas e
    JOIN escala_participantes ep 
      ON ep.escala_id = e.id
    JOIN pessoas p
      ON p.id = ep.pessoa_id
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