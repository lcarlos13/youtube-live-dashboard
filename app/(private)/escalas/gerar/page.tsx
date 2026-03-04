"use client";

import { useState } from "react";

export default function GerarEscalaPage() {
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [analisado, setAnalisado] = useState(false);

  const [bloqueados, setBloqueados] = useState<any[]>([]);
  const [disponiveis, setDisponiveis] = useState<any[]>([]);
  const [dispensados, setDispensados] = useState<number[]>([]);

  const [modelo, setModelo] = useState("ranking");
  const [quantidadePorFuncao, setQuantidadePorFuncao] = useState<any>({
    Live: 1,
    "Gravação": 1,
    "Computador Telão": 1,
    Fotografia: 1,
  });

  const [resultado, setResultado] = useState<any[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const funcoes = [
    "Live",
    "Gravação",
    "Computador Telão",
    "Fotografia"
  ];

  function formatarData(dataIso: string) {
    if (!dataIso) return "-";
    return new Date(dataIso).toLocaleDateString("pt-BR");
  }

  async function analisar() {
    const res = await fetch("/api/escalas/analisar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    const json = await res.json();

    setBloqueados(json.bloqueados || []);
    setDisponiveis(json.disponiveis || []);
    setAnalisado(true);
    setResultado([]);
    setAvisos([]);
  }

  function toggleDispensar(id: number) {
    setDispensados((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  }

  async function gerarEscala() {
    setLoading(true);

    const res = await fetch("/api/escalas/simular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        horario,
        modelo,
        dispensados,
        quantidadePorFuncao,
      }),
    });

    const json = await res.json();

    if (json.success) {
      setResultado(json.resultado || []);
      setAvisos(json.avisos || []);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold text-center">
          Gerar Escala Inteligente
        </h1>

        {/* 🔹 Parâmetros */}
        <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg grid md:grid-cols-4 gap-4 items-end">

          <div>
            <label className="text-sm text-zinc-400">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="bg-zinc-800 p-2 rounded-xl w-full"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Horário</label>
            <input
              type="time"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="bg-zinc-800 p-2 rounded-xl w-full"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Modelo</label>
            <select
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="bg-zinc-800 p-2 rounded-xl w-full"
            >
              <option value="ranking">🏆 Ranking</option>
              <option value="equilibrado">⚖️ Equilibrado</option>
            </select>
          </div>

          <button
            onClick={analisar}
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl"
          >
            Analisar
          </button>
        </div>

        {/* 🔴 BLOQUEADOS */}
        {analisado && (
          <div className="bg-red-900/40 border border-red-700 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-3">Bloqueados na data</h2>

            {bloqueados.length === 0 ? (
              <p className="text-zinc-300">Nenhuma pessoa bloqueada.</p>
            ) : (
              <ul className="space-y-1">
                {bloqueados.map((b) => (
                  <li key={b.id}>{b.nome}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 🟢 DISPONÍVEIS */}
        {analisado && (
          <div className="bg-green-900/40 border border-green-700 p-6 rounded-2xl shadow-lg overflow-x-auto">
            <h2 className="text-lg font-bold mb-3">Pessoas Disponíveis</h2>

            {disponiveis.length === 0 ? (
              <p>Ninguém disponível.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-zinc-400 border-b border-zinc-700">
                  <tr>
                    <th className="text-left py-2">Nome</th>
                    <th className="text-left">Última Escala</th>
                    <th className="text-left">Última Função</th>
                    <th className="text-left">Dias</th>
                    <th className="text-center">Dispensar</th>
                  </tr>
                </thead>
                <tbody>
                  {disponiveis.map((p) => (
                    <tr key={p.id} className="border-b border-zinc-800">
                      <td className="py-2">{p.nome}</td>
                      <td>{formatarData(p.ultimaData)}</td>
                      <td>{p.ultimaFuncao || "-"}</td>
                      <td>{p.diasDesdeUltima ?? "-"}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={dispensados.includes(p.id)}
                          onChange={() => toggleDispensar(p.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ⚙️ QUANTIDADE POR FUNÇÃO */}
        {analisado && (
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg space-y-4">
            <h2 className="text-lg font-bold">Quantidade por Função</h2>

            <div className="grid md:grid-cols-4 gap-4">
              {funcoes.map((funcao) => (
                <div key={funcao}>
                  <label className="text-sm text-zinc-400">{funcao}</label>
                  <input
                    type="number"
                    min={0}
                    value={quantidadePorFuncao[funcao]}
                    onChange={(e) =>
                      setQuantidadePorFuncao({
                        ...quantidadePorFuncao,
                        [funcao]: Number(e.target.value),
                      })
                    }
                    className="bg-zinc-800 p-2 rounded-xl w-full"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={gerarEscala}
              className="bg-green-600 hover:bg-green-700 transition px-6 py-2 rounded-xl mt-4"
            >
              {loading ? "Gerando escala..." : "Gerar Escala"}
            </button>
          </div>
        )}

        {/* 📋 RESULTADO */}
        {resultado.length > 0 && (
          <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-xl font-bold text-center">
              Escala Gerada
            </h2>

            {resultado.map((item) => (
              <div key={item.funcao}>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  {item.funcao}
                </h3>

                <ul className="space-y-1">
                  {item.pessoas.map((p: any) => (
                    <li
                      key={p.id}
                      className="bg-zinc-800 p-2 rounded-xl flex justify-between"
                    >
                      <span>{p.nome}</span>
                      <span className="text-sm text-zinc-400">
                        Nível {p.nivel} • {p.totalEscalas} escalas
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {avisos.length > 0 && (
              <div className="bg-yellow-900 p-4 rounded-xl">
                <h3 className="font-bold mb-2">Avisos</h3>
                {avisos.map((a, i) => (
                  <div key={i}>{a}</div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}