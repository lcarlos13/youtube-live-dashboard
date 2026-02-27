"use client";

import { useEffect, useState } from "react";

import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import toast, { Toaster } from "react-hot-toast";

interface Pessoa {
  id: number;
  nome: string;
}

interface Bloqueio {
  id: number;
  data: string;
  horario_inicio: string | null;
  horario_fim: string | null;
  motivo: string | null;
  nome_pessoa: string;
  pessoa_id: number;
}

export default function CadastroBloqueios() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);

  const [pessoaId, setPessoaId] = useState("");
  const [data, setData] = useState<Date | null>(null);
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [motivo, setMotivo] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [bloqueioSelecionado, setBloqueioSelecionado] = useState<number | null>(null);

  const [inicio, setInicio] = useState<string>("");
  const [fim, setFim] = useState<string>("");

  const [mostrarInicio, setMostrarInicio] = useState(false);
  const [mostrarFim, setMostrarFim] = useState(false);

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

  const carregarPessoas = async () => {
    const res = await fetch("/api/pessoas");
    const data = await res.json();
    setPessoas(data);
  };

  const buscarBloqueios = async () => {
    let url = "/api/bloqueios";

    const params = new URLSearchParams();

    if (inicio) params.append("inicio", inicio);
    if (fim) params.append("fim", fim);

    if (inicio || fim) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    setBloqueios(data);
  };

  useEffect(() => {
    carregarPessoas();
    buscarBloqueios();
  }, []);

  const salvar = async () => {
    if (!pessoaId || !data) {
      alert("Selecione a pessoa e a data");
      return;
    }

    const response = await fetch("/api/bloqueios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pessoa_id: Number(pessoaId),
        data,
        horario_inicio: horarioInicio || null,
        horario_fim: horarioFim || null,
        motivo,
      }),
    });

    if (!response.ok) {
      const erro = await response.json();
      alert(erro.error);
      return;
    }

    toast.success("Bloqueio salvo com sucesso!", {
      duration: 3000,
    });

    setPessoaId("");
    setData(null);
    setHorarioInicio("");
    setHorarioFim("");
    setMotivo("");

    await buscarBloqueios();
  };

  const excluir = async (id: number) => {

    await fetch(`/api/bloqueios?id=${id}`, {
      method: "DELETE",
    });

    await buscarBloqueios();
  };

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split("T")[0].split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHorario = (h: string | null) => {
    if (!h) return null;
    return h.slice(0, 5);
  };

  const confirmarExclusao = async () => {
    if (!bloqueioSelecionado) return;

    await excluir(bloqueioSelecionado);

    setModalAberto(false);
    setBloqueioSelecionado(null);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a"
          }
        }}
      />
      <div className="max-w-5xl mx-auto space-y-10">

        <h1 className="text-3xl font-semibold">
          🚫 Cadastro de Bloqueios
        </h1>

        <div className="bg-blue-900/40 border border-blue-700 text-blue-200 rounded-xl p-4 text-sm">
          <p className="font-semibold mb-1">ℹ️ Como funciona o bloqueio</p>
          <p>
            • Se você deixar os horários em branco, o bloqueio será considerado para o <strong>dia inteiro</strong>.
          </p>
          <p>
            • Se preencher horário início e fim, o bloqueio será válido apenas para o <strong>intervalo informado</strong>.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">

          <select
            value={pessoaId}
            onChange={(e) => setPessoaId(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3"
          >
            <option value="">Selecione a pessoa</option>
            {pessoas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <div className="w-full">
            <DatePicker
              selected={data}
              onChange={(date: Date | null) => setData(date)}
              dateFormat="dd/MM/yyyy"
              locale={ptBR}
              placeholderText="Selecione a data"
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="time"
              value={horarioInicio}
              onChange={(e) => setHorarioInicio(e.target.value)}
              className="bg-black border border-zinc-700 rounded-xl p-3"
              placeholder="Horário início (opcional)"
            />

            <input
              type="time"
              value={horarioFim}
              onChange={(e) => setHorarioFim(e.target.value)}
              className="bg-black border border-zinc-700 rounded-xl p-3"
              placeholder="Horário fim (opcional)"
            />
          </div>

          <input
            type="text"
            placeholder="Motivo (opcional)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl p-3"
          />

          <button
            onClick={salvar}
            className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-zinc-200 transition"
          >
            Salvar Bloqueio
          </button>
        </div>

        {/* LISTA */}
        <h2 className="text-2xl font-semibold mt-8">
          📋 Bloqueios cadastrados
        </h2>
        {/* Filtro Premium */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12 flex flex-wrap gap-6 items-end shadow-xl">

          {/* Data Início */}
          <div className="relative">
            <label className="text-xs uppercase text-zinc-500 block mb-2">
              Data Início
            </label>

            <button
              onClick={() => setMostrarInicio(!mostrarInicio)}
              className="bg-black border border-zinc-700 rounded-xl px-4 py-2 w-[180px] text-left"
            >
              {inicio ? formatarData(inicio) : "Selecionar"}
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

          {/* Data Fim */}
          <div className="relative">
            <label className="text-xs uppercase text-zinc-500 block mb-2">
              Data Fim
            </label>

            <button
              onClick={() => setMostrarFim(!mostrarFim)}
              className="bg-black border border-zinc-700 rounded-xl px-4 py-2 w-[180px] text-left"
            >
              {fim ? formatarData(fim) : "Selecionar"}
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
            onClick={buscarBloqueios}
            className="bg-white text-black px-8 py-2 rounded-xl font-medium hover:bg-zinc-200 transition-all"
          >
            Filtrar
          </button>

        </div>
        <div className="space-y-4">
          {bloqueios.map((b) => (
            <div
              key={b.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between items-center hover:border-white transition"
            >
              <div>
                <p className="font-semibold">{b.nome_pessoa}</p>
                <p className="text-sm text-zinc-400">
                  {formatarData(b.data)}
                  {b.horario_inicio && b.horario_fim && (
                    <> • {formatarHorario(b.horario_inicio)} - {formatarHorario(b.horario_fim)}</>
                  )}
                </p>
                {b.motivo && (
                  <p className="text-xs text-zinc-500 mt-1">
                    {b.motivo}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setBloqueioSelecionado(b.id);
                  setModalAberto(true);
                }}
                className="text-red-500 hover:text-red-400 transition"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

      </div>
      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-[90%] max-w-md space-y-4 shadow-2xl">
            
            <h3 className="text-lg font-semibold">
              Confirmar exclusão
            </h3>

            <p className="text-sm text-zinc-400">
              Tem certeza que deseja excluir este bloqueio?
              Essa ação não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-3 pt-4">
              
              <button
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarExclusao}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition"
              >
                Excluir
              </button>

            </div>

          </div>
        </div>
      )}
    </main>
  );
}