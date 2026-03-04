"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Funcao {
  id: number;
  nome: string;
}

interface PessoaFuncao {
  id: number;
  funcao_id: number;
  nome: string;
  nivel: number;
}

export default function PessoaFuncoesPage() {
  const params = useParams();
  const pessoaId = Number(params.id);

  const [funcoesDisponiveis, setFuncoesDisponiveis] = useState<Funcao[]>([]);
  const [funcoesPessoa, setFuncoesPessoa] = useState<PessoaFuncao[]>([]);
  const [funcaoSelecionada, setFuncaoSelecionada] = useState<number | "">("");
  const [nivel, setNivel] = useState(1);

  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  // 🔄 carregar funções disponíveis
  async function carregarFuncoes() {
    const res = await fetch("/api/funcoes");
    const data = await res.json();
    if (res.ok) setFuncoesDisponiveis(data);
  }

  // 🔄 carregar funções da pessoa
  async function carregarFuncoesPessoa() {
    const res = await fetch(`/api/pessoa-funcoes?pessoaId=${pessoaId}`);
    const data = await res.json();
    if (res.ok) setFuncoesPessoa(data);
  }

  useEffect(() => {
    if (pessoaId) {
      carregarFuncoes();
      carregarFuncoesPessoa();
    }
  }, [pessoaId]);

  // ➕ adicionar função
  async function adicionarFuncao(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!funcaoSelecionada) {
      setErro("Selecione uma função");
      return;
    }

    const res = await fetch("/api/pessoa-funcoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pessoaId,
        funcaoId: funcaoSelecionada,
        nivel,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error);
    } else {
      setMensagem("Função adicionada com sucesso");
      setFuncaoSelecionada("");
      setNivel(1);
      carregarFuncoesPessoa();
    }
  }

  // 🗑 remover função
  async function removerFuncao(id: number) {
    await fetch(`/api/pessoa-funcoes/${id}`, {
      method: "DELETE",
    });

    carregarFuncoesPessoa();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">
        Gerenciar Funções da Pessoa
      </h1>

      {/* ================= ADICIONAR ================= */}
      <form
        onSubmit={adicionarFuncao}
        className="bg-zinc-900 p-6 rounded space-y-4"
      >
        <div>
          <label className="block text-sm mb-1 text-zinc-400">
            Função
          </label>
          <select
            value={funcaoSelecionada}
            onChange={(e) =>
              setFuncaoSelecionada(
                e.target.value ? Number(e.target.value) : ""
              )
            }
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
          >
            <option value="">Selecione</option>
            {funcoesDisponiveis.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-zinc-400">
            Nível
          </label>
          <input
            type="number"
            min={1}
            value={nivel}
            onChange={(e) => setNivel(Number(e.target.value))}
            className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white"
        >
          Adicionar Função
        </button>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}
        {mensagem && <p className="text-green-400 text-sm">{mensagem}</p>}
      </form>

      {/* ================= LISTA ================= */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">
          Funções atribuídas
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead className="bg-zinc-800 text-zinc-300">
              <tr>
                <th className="p-2 border">Função</th>
                <th className="p-2 border">Nível</th>
                <th className="p-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcoesPessoa.map((f) => (
                <tr
                  key={f.id}
                  className="text-center border-t border-zinc-700"
                >
                  <td className="p-2">{f.nome}</td>
                  <td className="p-2">{f.nivel}</td>
                  <td className="p-2">
                    <button
                      onClick={() => removerFuncao(f.id)}
                      className="px-2 py-1 bg-red-600 rounded text-white text-xs"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {funcoesPessoa.length === 0 && (
            <p className="text-center text-zinc-400 mt-4">
              Nenhuma função atribuída
            </p>
          )}
        </div>
      </div>
    </div>
  );
}