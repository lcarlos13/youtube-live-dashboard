"use client";

import { useEffect, useState } from "react";

interface Pessoa {
  id: number;
  nome: string;
}

interface Funcao {
  id: number;
  nome: string;
}

interface PessoaFuncao {
  id: number;
  pessoa_nome: string;
  funcao_nome: string;
  nivel: number;
}

export default function GerenciarFuncoesPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [lista, setLista] = useState<PessoaFuncao[]>([]);

  const [pessoaId, setPessoaId] = useState<number | "">("");
  const [funcaoId, setFuncaoId] = useState<number | "">("");
  const [nivel, setNivel] = useState(1);

  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function carregarDados() {
    const pessoasRes = await fetch("/api/pessoas");
    const funcoesRes = await fetch("/api/funcoes");
    const listaRes = await fetch("/api/pessoa-funcoes");

    if (pessoasRes.ok) setPessoas(await pessoasRes.json());
    if (funcoesRes.ok) setFuncoes(await funcoesRes.json());
    if (listaRes.ok) setLista(await listaRes.json());
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMensagem(null);

    if (!pessoaId || !funcaoId) {
      setErro("Selecione pessoa e função");
      return;
    }

    const res = await fetch("/api/pessoa-funcoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pessoaId, funcaoId, nivel }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error);
    } else {
      setMensagem("Função adicionada com sucesso");
      setPessoaId("");
      setFuncaoId("");
      setNivel(1);
      carregarDados();
    }
  }

  async function remover(id: number) {
    await fetch(`/api/pessoa-funcoes/${id}`, {
      method: "DELETE",
    });

    carregarDados();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-10">

        <div>
          <h1 className="text-3xl font-bold">Gerenciar Funções</h1>
          <p className="text-zinc-400">
            Defina quais funções cada pessoa pode exercer e seu nível.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={adicionar}
          className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4"
        >
          <div className="grid md:grid-cols-3 gap-4">

            <select
              value={pessoaId}
              onChange={(e) =>
                setPessoaId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl"
            >
              <option value="">Selecione a Pessoa</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>

            <select
              value={funcaoId}
              onChange={(e) =>
                setFuncaoId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl"
            >
              <option value="">Selecione a Função</option>
              {funcoes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value))}
              className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl"
            />

          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl"
          >
            Adicionar Função
          </button>

          {erro && <p className="text-red-400">{erro}</p>}
          {mensagem && <p className="text-green-400">{mensagem}</p>}
        </form>

        {/* TABELA */}
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4">
            Funções Atribuídas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-zinc-700">
              <thead className="bg-zinc-800 text-zinc-300">
                <tr>
                  <th className="p-2 border">Pessoa</th>
                  <th className="p-2 border">Função</th>
                  <th className="p-2 border">Nível</th>
                  <th className="p-2 border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((item) => (
                  <tr key={item.id} className="text-center border-t border-zinc-700">
                    <td className="p-2">{item.pessoa_nome}</td>
                    <td className="p-2">{item.funcao_nome}</td>
                    <td className="p-2">{item.nivel}</td>
                    <td className="p-2">
                      <button
                        onClick={() => remover(item.id)}
                        className="px-2 py-1 bg-red-600 rounded text-xs"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {lista.length === 0 && (
              <p className="text-center text-zinc-400 mt-4">
                Nenhuma função cadastrada
              </p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}