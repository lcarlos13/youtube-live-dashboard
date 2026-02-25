import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  if (!inicio || !fim) {
    return NextResponse.json({ error: "Período obrigatório" }, { status: 400 });
  }

  const result = await pool.query(
    `
    SELECT 
      ep.nome_pessoa,
      ep.funcao,
      COUNT(*) as total
    FROM escala_participantes ep
    JOIN escalas e ON e.id = ep.escala_id
    WHERE e.data BETWEEN $1 AND $2
    GROUP BY ep.nome_pessoa, ep.funcao
    `,
    [inicio, fim]
  );

  const dados = result.rows;

  const pessoasMap: any = {};
  const funcaoStats: any = {};
  let totalParticipacoes = 0;

  dados.forEach((row) => {
    const total = Number(row.total);
    totalParticipacoes += total;

    if (!pessoasMap[row.nome_pessoa]) {
      pessoasMap[row.nome_pessoa] = {
        nome: row.nome_pessoa,
        total: 0,
        funcoes: {},
      };
    }

    pessoasMap[row.nome_pessoa].funcoes[row.funcao] = total;
    pessoasMap[row.nome_pessoa].total += total;

    funcaoStats[row.funcao] =
      (funcaoStats[row.funcao] || 0) + total;
  });

  const pessoas = Object.values(pessoasMap);

  const ranking = [...pessoas].sort(
    (a: any, b: any) => b.total - a.total
  );

  const pessoaMaisEscalada = ranking[0] || null;

  const funcaoMaisUsada =
    Object.entries(funcaoStats).sort(
      (a: any, b: any) => b[1] - a[1]
    )[0] || null;

  return NextResponse.json({
    kpis: {
      totalParticipacoes,
      totalPessoas: pessoas.length,
      pessoaMaisEscalada,
      funcaoMaisUsada,
    },
    ranking,
    funcaoStats,
    tabela: pessoas,
  });
}