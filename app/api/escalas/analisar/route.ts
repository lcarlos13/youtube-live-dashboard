import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { data } = await req.json();

  if (!data) {
    return NextResponse.json(
      { error: "Data obrigatória" },
      { status: 400 }
    );
  }

  // 🔴 Buscar bloqueados
  const bloqueadosResult = await pool.query(
    `
    SELECT p.id, p.nome
    FROM bloqueios b
    JOIN pessoas p ON p.id = b.pessoa_id
    WHERE b.data = $1
    `,
    [data]
  );

  const bloqueados = bloqueadosResult.rows;

  // 🟢 Buscar pessoas ativas
  const pessoasResult = await pool.query(`
    SELECT id, nome
    FROM pessoas
    WHERE ativo = true
  `);

  const pessoas = pessoasResult.rows;

  // 🔎 Buscar última escala de cada pessoa
  const ultimaEscalaResult = await pool.query(`
    SELECT 
      ep.pessoa_id,
      MAX(e.data) AS ultima_data
    FROM escala_participantes ep
    JOIN escalas e ON e.id = ep.escala_id
    GROUP BY ep.pessoa_id
  `);

  const mapaUltimaData: any = {};
  ultimaEscalaResult.rows.forEach((r) => {
    mapaUltimaData[r.pessoa_id] = r.ultima_data;
  });

  // 🔎 Buscar última função
  const ultimaFuncaoResult = await pool.query(`
    SELECT DISTINCT ON (ep.pessoa_id)
      ep.pessoa_id,
      ep.funcao,
      e.data
    FROM escala_participantes ep
    JOIN escalas e ON e.id = ep.escala_id
    ORDER BY ep.pessoa_id, e.data DESC
  `);

  const mapaUltimaFuncao: any = {};
  ultimaFuncaoResult.rows.forEach((r) => {
    mapaUltimaFuncao[r.pessoa_id] = r.funcao;
  });

  const hoje = new Date(data);

  const disponiveis = pessoas
    .filter(
      (p) => !bloqueados.find((b: any) => b.id === p.id)
    )
    .map((p) => {
      const ultimaData = mapaUltimaData[p.id] || null;
      const ultimaFuncao = mapaUltimaFuncao[p.id] || null;

      let diasDesdeUltima = null;

      if (ultimaData) {
        const diff =
          (hoje.getTime() - new Date(ultimaData).getTime()) /
          (1000 * 60 * 60 * 24);
        diasDesdeUltima = Math.floor(diff);
      }

      return {
        ...p,
        ultimaData,
        ultimaFuncao,
        diasDesdeUltima,
      };
    });

  return NextResponse.json({
    bloqueados,
    disponiveis,
  });
}