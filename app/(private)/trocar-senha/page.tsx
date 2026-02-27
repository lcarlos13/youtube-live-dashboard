"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrocarSenhaPage() {
  const router = useRouter();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/trocar-senha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ novaSenha }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Erro ao trocar senha");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">

        <h1 className="text-2xl font-semibold mb-6 text-center">
          🔑 Trocar Senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-xs uppercase text-zinc-500 block mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2 focus:outline-none focus:border-white transition"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase text-zinc-500 block mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2 focus:outline-none focus:border-white transition"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          {erro && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-xl p-3">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black px-8 py-2 rounded-xl font-medium hover:bg-zinc-200 transition-all"
          >
            {loading ? "Atualizando..." : "Atualizar Senha"}
          </button>

        </form>
      </div>
    </main>
  );
}