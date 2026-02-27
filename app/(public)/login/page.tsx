"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Erro ao logar");
      setLoading(false);
      return;
    }

    if (data.precisaTrocarSenha) {
      router.push("/trocar-senha");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">

          <h1 className="text-2xl font-semibold mb-2 text-center">
            🔐 Midia Dashboard
          </h1>

          <p className="text-zinc-500 text-sm text-center mb-8">
            Faça login para continuar
          </p>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="text-xs uppercase text-zinc-500 block mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2 focus:outline-none focus:border-white transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase text-zinc-500 block mb-2">
                Senha
              </label>
              <input
                type="password"
                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-2 focus:outline-none focus:border-white transition"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </form>
        </div>

      </div>
    </main>
  );
}