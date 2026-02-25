"use client";

import { useEffect, useState } from "react";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Escala {
  escala_id: number;
  data: string;
  horario: string;
  participante_id: number;
  nome_pessoa: string;
  funcao: string;
}

export default function VisualizarEscalas() {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFim, setMostrarFim] = useState(false);

  const formatarParaBanco = (date: Date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  };

  const [inicio, setInicio] = useState(formatarParaBanco(primeiroDia));
  const [fim, setFim] = useState(formatarParaBanco(ultimoDia));
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(false);
  const [aberta, setAberta] = useState<number | null>(null);

  const buscarEscalas = async () => {
    setLoading(true);

    const res = await fetch(
      `/api/escalas?inicio=${inicio}&fim=${fim}`
    );

    const data = await res.json();
    setEscalas(data);

    setLoading(false);
  };

  useEffect(() => {
    buscarEscalas();
  }, []);

  const escalasAgrupadas = escalas.reduce((acc: any, item) => {
    if (!acc[item.escala_id]) {
      acc[item.escala_id] = [];
    }
    acc[item.escala_id].push(item);
    return acc;
  }, {});

  const badgeColor = (funcao: string) => {
    switch (funcao.toLowerCase()) {
      case "live":
        return "bg-purple-600/20 text-purple-400 border-purple-600";
      case "fotografia":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600";
      case "gravação":
      case "gravacao":
        return "bg-blue-600/20 text-blue-400 border-blue-600";
      case "computador telão":
      case "computador telao":
        return "bg-green-600/20 text-green-400 border-green-600";
      default:
        return "bg-zinc-700 text-zinc-300 border-zinc-600";
    }
  };

  const formatarData = (dataString: string) => {
    const apenasData = dataString.split("T")[0]; // remove parte do horário
    const [ano, mes, dia] = apenasData.split("-");

    return `${dia}/${mes}/${ano}`;
  };

  const formatarHorario = (horario: string) => {
    return horario.slice(0, 5);
  };

  const excluirEscala = async (id: number) => {
    const confirmar = confirm("Tem certeza que deseja excluir esta escala?");
    if (!confirmar) return;

    await fetch(`/api/escalas?id=${id}`, {
      method: "DELETE",
    });

    buscarEscalas();
  };

  const parseDataLocal = (data: string) => {
    const [ano, mes, dia] = data.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-semibold mb-10">
          👀 Visualizar Escalas
        </h1>

        {/* Filtro Premium */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12 flex flex-wrap gap-6 items-end shadow-xl">

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
            onClick={buscarEscalas}
            className="bg-white text-black px-8 py-2 rounded-xl font-medium hover:bg-zinc-200 transition-all"
          >
            Filtrar
          </button>
        </div>

        {loading ? (
          <p className="text-zinc-400">Carregando escalas...</p>
        ) : (
          <div className="space-y-6">

            {Object.entries(escalasAgrupadas).map(
              ([escalaId, itens]: any) => (
                <div
                  key={escalaId}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Header da Escala */}
                  <div
                    onClick={() =>
                      setAberta(
                        aberta === Number(escalaId)
                          ? null
                          : Number(escalaId)
                      )
                    }
                    className="cursor-pointer p-6 flex justify-between items-center hover:bg-zinc-800 transition"
                  >
                    <div>
                      <h2 className="text-lg font-semibold">
                        📅 {formatarData(itens[0].data)} • {formatarHorario(itens[0].horario)}
                      </h2>
                      <p className="text-sm text-zinc-500">
                        {itens.length} participantes
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          excluirEscala(Number(escalaId));
                        }}
                        className="text-red-500 hover:text-red-400 transition"
                      >
                        🗑️
                      </button>

                      <span className="text-zinc-400">
                        {aberta === Number(escalaId) ? "▲" : "▼"}
                      </span>

                    </div>
                  </div>

                  {/* Participantes */}
                  {aberta === Number(escalaId) && (
                    <div className="border-t border-zinc-800 p-6 grid md:grid-cols-2 gap-4 bg-black/40">

                      {itens.map((item: Escala) => (
                        <div
                          key={item.participante_id}
                          className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-white transition"
                        >
                          <span
                            className={`text-xs px-3 py-1 rounded-full border ${badgeColor(
                              item.funcao
                            )}`}
                          >
                            {item.funcao}
                          </span>

                          <span className="font-medium">
                            {item.nome_pessoa}
                          </span>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}