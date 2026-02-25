"use client";

import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Relatorios() {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const formatarParaBanco = (date: Date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const parseDataLocal = (data: string) => {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  };

  const formatarData = (dataString: string) => {
    const apenasData = dataString.slice(0, 10);
    const [ano, mes, dia] = apenasData.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const [inicio, setInicio] = useState(formatarParaBanco(primeiroDia));
  const [fim, setFim] = useState(formatarParaBanco(ultimoDia));
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFim, setMostrarFim] = useState(false);

  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [sortKey, setSortKey] = useState<string>("total");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");


  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const buscarRelatorio = async () => {
    setLoading(true);

    const res = await fetch(
      `/api/relatorios?inicio=${inicio}&fim=${fim}`
    );

    const json = await res.json();
    setDados(json);

    setLoading(false);
  };

  useEffect(() => {
    buscarRelatorio();
  }, []);


  const rankingChartData =
    dados?.ranking.map((p: any) => ({
      nome: p.nome,
      total: p.total,
    })) || [];

  const funcaoChartData =
    dados
      ? Object.entries(dados?.funcaoStats).map(
          ([funcao, total]: any) => ({
            funcao,
            total,
          })
        )
      : [];

  const funcoes = Object.keys(dados?.funcaoStats || {});

  const tabelaData = (dados?.ranking || []).map((p: any) => {
    const linha: any = {
      nome: p.nome,
      total: Number(p.total) || 0,
    };

    funcoes.forEach((funcao) => {
      linha[funcao] =
        Number(p.funcoes?.[funcao]) || 0;
    });

    return linha;
  });


  const sortedData = [...tabelaData].sort((a, b) => {
    if (sortKey === "nome") {
      return sortOrder === "asc"
        ? a.nome.localeCompare(b.nome)
        : b.nome.localeCompare(a.nome);
    }

    const aValue = Number(a[sortKey]) || 0;
    const bValue = Number(b[sortKey]) || 0;

    return sortOrder === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-semibold mb-10">
          📊 Relatórios
        </h1>

        {/* FILTRO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12 flex flex-wrap gap-6 items-end shadow-xl">

          {/* INICIO */}
          <div className="relative">
            <label className="text-xs uppercase text-zinc-500 block mb-2">
              Data Início
            </label>

            <button
              onClick={() => setMostrarInicio(!mostrarInicio)}
              className="bg-black border border-zinc-700 rounded-xl px-4 py-2 w-[180px] text-left"
            >
              {formatarData(inicio)}
            </button>

            {mostrarInicio && (
              <div className="absolute mt-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl z-50">
                <DayPicker
                  mode="single"
                  selected={parseDataLocal(inicio)}
                  onSelect={(date) => {
                    if (!date) return;
                    setInicio(formatarParaBanco(date));
                    setMostrarInicio(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* FIM */}
          <div className="relative">
            <label className="text-xs uppercase text-zinc-500 block mb-2">
              Data Fim
            </label>

            <button
              onClick={() => setMostrarFim(!mostrarFim)}
              className="bg-black border border-zinc-700 rounded-xl px-4 py-2 w-[180px] text-left"
            >
              {formatarData(fim)}
            </button>

            {mostrarFim && (
              <div className="absolute mt-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl z-50">
                <DayPicker
                  mode="single"
                  selected={parseDataLocal(fim)}
                  onSelect={(date) => {
                    if (!date) return;
                    setFim(formatarParaBanco(date));
                    setMostrarFim(false);
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={buscarRelatorio}
            className="bg-white text-black px-8 py-2 rounded-xl font-medium hover:bg-zinc-200 transition-all"
          >
            Filtrar
          </button>
        </div>

        {loading && <p>Carregando...</p>}

        {dados && (
          <>
            {/* KPIs */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Participações</p>
                <h2 className="text-2xl font-bold">
                  {dados.kpis.totalParticipacoes}
                </h2>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Pessoas Ativas</p>
                <h2 className="text-2xl font-bold">
                  {dados.kpis.totalPessoas}
                </h2>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Mais Escalado</p>
                <h2 className="text-xl font-bold">
                  {dados.kpis.pessoaMaisEscalada?.nome || "-"}
                </h2>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <p className="text-zinc-400 text-sm">Função Mais Usada</p>
                <h2 className="text-xl font-bold">
                  {dados.kpis.funcaoMaisUsada?.[0] || "-"}
                </h2>
              </div>

            </div>

            {/* RANKING */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12">
              <h2 className="text-lg font-semibold mb-6">
                🏆 Ranking
              </h2>

              <div className="space-y-3">
                {dados.ranking.map((p: any) => (
                  <div
                    key={p.nome}
                    className="flex justify-between border-b border-zinc-800 pb-2"
                  >
                    <span>{p.nome}</span>
                    <span>{p.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GRÁFICOS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-10">
              <h2 className="text-lg font-semibold mb-4 text-zinc-100">
                📊 Participações por Pessoa
              </h2>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[500px] h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rankingChartData}>
                      
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#27272a"
                      />

                      <XAxis
                        dataKey="nome"
                        stroke="#d4d4d8"
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12, fill: "#d4d4d8" }}
                      />

                      <YAxis
                        stroke="#d4d4d8"
                        tick={{ fill: "#d4d4d8" }}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{
                          backgroundColor: "#18181b",
                          border: "1px solid #27272a",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                      />

                      <Bar
                        dataKey="total"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-16">
              <h2 className="text-lg font-semibold mb-6 text-zinc-100">
                📋 Relatório Detalhado
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th
                        onClick={() => handleSort("nome")}
                        className="cursor-pointer text-left py-3 pr-6 hover:text-white transition"
                      >
                        Pessoa
                      </th>

                      <th
                        onClick={() => handleSort("total")}
                        className="cursor-pointer text-center py-3 px-4 hover:text-white transition"
                      >
                        Total
                      </th>

                      {funcoes.map((funcao) => (
                        <th
                          key={funcao}
                          onClick={() => handleSort(funcao)}
                          className="cursor-pointer text-center py-3 px-4 hover:text-white transition"
                        >
                          {funcao}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sortedData.map((row: any) => (
                      <tr
                        key={row.nome}
                        className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
                      >
                        <td className="py-3 pr-6 text-zinc-200 font-medium">
                          {row.nome}
                        </td>

                        <td className="text-center py-3 px-4 font-semibold text-blue-400">
                          {row.total}
                        </td>

                        {funcoes.map((funcao) => {
                          const valor = Number(row[funcao]) || 0;

                          return (
                            <td
                              key={funcao}
                              className="text-center py-3 px-4"
                            >
                              {valor > 0 ? (
                                <span className="inline-block min-w-[28px] px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                                  {valor}
                                </span>
                              ) : (
                                <span className="text-zinc-600 text-xs">
                                  0
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

          </>
        )}

      </div>
    </main>
  );
}