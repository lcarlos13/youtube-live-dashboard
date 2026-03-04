import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      data,
      horario,
      modelo,
      dispensados,
      quantidadePorFuncao,
    } = await req.json();

    const client = await pool.connect();

    const resultado: any[] = [];
    const avisos: string[] = [];
    const jaSelecionados = new Set<number>();

    // 🔎 Buscar última escala (50 últimos registros)
    const ultimaEscalaRes = await client.query(`
      SELECT ep.pessoa_id
      FROM escalas e
      JOIN escala_participantes ep ON ep.escala_id = e.id
      ORDER BY e.data DESC
      LIMIT 50
    `);

    const pessoasUltimaEscala = new Set(
      ultimaEscalaRes.rows.map((r) => r.pessoa_id)
    );

    // 🔎 Buscar bloqueados
    const bloqueadosRes = await client.query(
      `SELECT pessoa_id FROM bloqueios WHERE data = $1`,
      [data]
    );

    const bloqueados = new Set(
      bloqueadosRes.rows.map((r) => r.pessoa_id)
    );

    const dispensadosSet = new Set(dispensados || []);

    // 🔁 Para cada função
    for (const funcao of Object.keys(quantidadePorFuncao)) {
      const quantidade = quantidadePorFuncao[funcao];

      const candidatosRes = await client.query(
        `
        SELECT 
          pf.pessoa_id,
          pf.nivel,
          COUNT(ep.id) as total
        FROM pessoa_funcoes pf
        JOIN funcoes f ON f.id = pf.funcao_id
        LEFT JOIN escala_participantes ep 
          ON ep.pessoa_id = pf.pessoa_id
          AND ep.funcao = f.nome
        WHERE f.nome = $1
        GROUP BY pf.pessoa_id, pf.nivel
        `,
        [funcao]
      );

      // 🧹 Filtrar indisponíveis
      let candidatosFiltrados = candidatosRes.rows.filter((c) => {
        if (bloqueados.has(c.pessoa_id)) return false;
        if (dispensadosSet.has(c.pessoa_id)) return false;
        if (jaSelecionados.has(c.pessoa_id)) return false;
        return true;
      });

      // 🧠 Aplicar modelo
      candidatosFiltrados.sort((a, b) => {
      const totalA = Number(a.total);
      const totalB = Number(b.total);

      if (modelo === "ranking") {
        // 🏆 Top Team

        // 1️⃣ Maior nível primeiro
        if (b.nivel !== a.nivel) {
          return b.nivel - a.nivel;
        }

        // 2️⃣ Quem MAIS serviu primeiro
        if (totalB !== totalA) {
          return totalB - totalA; // DESC
        }

        return 0; // não evita última escala
      }

      if (modelo === "equilibrado") {
        // ⚖️ Distribuição justa

        // 1️⃣ Quem MENOS serviu primeiro
        if (totalA !== totalB) {
          return totalA - totalB; // ASC
        }

        // 2️⃣ Evitar quem esteve na última escala
        const ultimaA = pessoasUltimaEscala.has(a.pessoa_id) ? 1 : 0;
        const ultimaB = pessoasUltimaEscala.has(b.pessoa_id) ? 1 : 0;

        return ultimaA - ultimaB;
      }

      return 0;
    });

      const selecionados = candidatosFiltrados.slice(0, quantidade);

      selecionados.forEach((s) => {
        jaSelecionados.add(s.pessoa_id);
      });

      if (selecionados.length < quantidade) {
        avisos.push(
          `Função ${funcao}: precisava ${quantidade}, conseguiu ${selecionados.length}`
        );
      }

      // Buscar nomes
      const ids = selecionados.map((s) => s.pessoa_id);

      let nomes = [];
      if (ids.length > 0) {
        const nomesRes = await client.query(
          `SELECT id, nome FROM pessoas WHERE id = ANY($1)`,
          [ids]
        );
        nomes = nomesRes.rows;
      }

      resultado.push({
        funcao,
        pessoas: selecionados.map((s) => {
          const pessoa = nomes.find((n) => n.id === s.pessoa_id);
          return {
            id: s.pessoa_id,
            nome: pessoa?.nome || "Desconhecido",
            nivel: s.nivel,
            totalEscalas: Number(s.total),
          };
        }),
      });
    }

    client.release();

    return NextResponse.json({
      success: true,
      data,
      horario,
      modelo,
      resultado,
      avisos,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao simular escala" },
      { status: 500 }
    );
  }
}