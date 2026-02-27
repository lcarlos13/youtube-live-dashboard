"use client";

import { useEffect, useState } from "react";

interface Pessoa {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  email: string;
  perfil: string;
  ativo: boolean;
  criado_em: string;
  pessoa_nome: string;
}

export default function UsuariosPage() {
  // 🔹 Cadastro
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoaId, setPessoaId] = useState<number | "">("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("user");

  // 🔹 Lista
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [confirmacao, setConfirmacao] = useState<{
    tipo: "excluir" | "resetar" | null;
    usuarioId: number | null;
  }>({
    tipo: null,
    usuarioId: null,
  });
  const [toast, setToast] = useState<string | null>(null);

  function mostrarToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // 🔄 Carregar pessoas
  async function carregarPessoas() {
    try {
      const res = await fetch("/api/pessoas");
      const data = await res.json();
      if (res.ok) setPessoas(data);
    } catch {
      setErro("Erro ao carregar pessoas");
    }
  }

  // 🔄 Carregar usuários
  async function carregarUsuarios() {
    try {
      const res = await fetch("/api/usuarios");
      const data = await res.json();
      if (res.ok) setUsuarios(data);
    } catch {
      setErro("Erro ao carregar usuários");
    }
  }

  useEffect(() => {
    carregarPessoas();
    carregarUsuarios();
  }, []);

  // ✅ Criar usuário
  async function handleCriarUsuario(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);
    setErro(null);

    if (!pessoaId || !email || !perfil) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pessoaId, email, perfil }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao criar usuário");
      } else {
        setMensagem("Usuário criado! Senha padrão: 123mudar");
        setPessoaId("");
        setEmail("");
        setPerfil("user");
        carregarUsuarios(); // 🔥 Atualiza lista
      }
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  // 🔁 Alterar status
  async function alterarStatus(id: number, ativo: boolean) {
    await fetch(`/api/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });

    carregarUsuarios();
  }

  function abrirConfirmacaoReset(id: number) {
    setConfirmacao({ tipo: "resetar", usuarioId: id });
  }

  function abrirConfirmacaoExcluir(id: number) {
    setConfirmacao({ tipo: "excluir", usuarioId: id });
  }

  async function executarConfirmacao() {
    if (!confirmacao.usuarioId) return;

    if (confirmacao.tipo === "excluir") {
      await fetch(`/api/usuarios/${confirmacao.usuarioId}`, {
        method: "DELETE",
      });
      mostrarToast("Usuário excluído com sucesso");
    }

    if (confirmacao.tipo === "resetar") {
      await fetch(`/api/usuarios/${confirmacao.usuarioId}/reset`, {
        method: "PATCH",
      });
      mostrarToast("Senha resetada para 123mudar");
    }

    setConfirmacao({ tipo: null, usuarioId: null });
    carregarUsuarios();
  }

  // 🗑️ Excluir
  async function excluirUsuario(id: number) {

    await fetch(`/api/usuarios/${id}`, {
      method: "DELETE",
    });

    carregarUsuarios();
  }

  

  async function resetarSenha(id: number) {

    await fetch(`/api/usuarios/${id}/reset`, {
      method: "PATCH",
    });

  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">

      {/* ================= CADASTRO ================= */}
      <div>
        <h1 className="text-2xl font-bold mb-6 text-white">
          Criar Usuário
        </h1>

        <form onSubmit={handleCriarUsuario} className="space-y-4">

          <div>
            <label className="block text-sm mb-1 text-zinc-400">
              Pessoa
            </label>
            <select
              value={pessoaId}
              onChange={(e) =>
                setPessoaId(
                  e.target.value ? Number(e.target.value) : ""
                )
              }
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
            >
              <option value="">Selecione</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-zinc-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-zinc-400">
              Perfil
            </label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white"
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded text-white disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Usuário"}
          </button>

          {erro && (
            <p className="text-red-400 text-sm text-center">
              {erro}
            </p>
          )}

          {mensagem && (
            <p className="text-green-400 text-sm text-center">
              {mensagem}
            </p>
          )}
        </form>
      </div>

      {/* ================= LISTA ================= */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Usuários Cadastrados
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead className="bg-zinc-800 text-zinc-300">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Pessoa</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Perfil</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Criado em</th>
                <th className="p-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="text-center border-t border-zinc-700">
                  <td className="p-2">{u.id}</td>
                  <td className="p-2">{u.pessoa_nome}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.perfil}</td>
                  <td className="p-2">
                    {u.ativo ? "Ativo" : "Inativo"}
                  </td>
                  <td className="p-2">
                    {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => alterarStatus(u.id, u.ativo)}
                      className="px-2 py-1 bg-yellow-600 rounded text-white text-xs"
                    >
                      {u.ativo ? "Desativar" : "Ativar"}
                    </button>

                    <button
                      onClick={() => abrirConfirmacaoExcluir(u.id)}
                      className="px-2 py-1 bg-red-600 rounded text-white text-xs"
                    >
                      Excluir
                    </button>

                    <button
                      onClick={() => abrirConfirmacaoReset(u.id)}
                      className="px-2 py-1 bg-purple-600 rounded text-white text-xs"
                    >
                      Resetar Senha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usuarios.length === 0 && (
            <p className="text-center text-zinc-400 mt-4">
              Nenhum usuário cadastrado
            </p>
          )}
        </div>
      </div>
      {confirmacao.tipo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-lg w-80 space-y-4">
            <p className="text-white text-center">
              {confirmacao.tipo === "excluir"
                ? "Deseja realmente excluir este usuário?"
                : "Deseja resetar a senha para 123mudar?"}
            </p>

            <div className="flex justify-between gap-4">
              <button
                onClick={() =>
                  setConfirmacao({ tipo: null, usuarioId: null })
                }
                className="w-full bg-zinc-700 p-2 rounded text-white"
              >
                Cancelar
              </button>

              <button
                onClick={executarConfirmacao}
                className="w-full bg-red-600 p-2 rounded text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
    
  );
}