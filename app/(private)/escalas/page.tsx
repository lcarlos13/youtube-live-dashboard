"use client";

import Link from "next/link";

export default function EscalasMenu() {
  return (
    <main className="bg-zinc-950 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <h1 className="text-2xl font-semibold tracking-tight mb-8">
          📋 Escalas
        </h1>

        {/* Grid de opções */}
        <div className="grid gap-6">

          {/* Adicionar Escala */}
          <Link href="/escalas/adicionar">
            <div className="
              bg-zinc-900
              border border-zinc-800
              rounded-2xl
              p-6
              hover:border-white
              hover:bg-zinc-800
              transition-all
              cursor-pointer
            ">
              <div className="flex items-center gap-4">
                <div className="text-3xl">➕</div>
                <div>
                  <h2 className="text-lg font-medium">
                    Adicionar Escala
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Importar nova escala através de imagem
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Visualizar Escalas */}
          <Link href="/escalas/visualizar">
            <div className="
              bg-zinc-900
              border border-zinc-800
              rounded-2xl
              p-6
              hover:border-white
              hover:bg-zinc-800
              transition-all
              cursor-pointer
            ">
              <div className="flex items-center gap-4">
                <div className="text-3xl">👀</div>
                <div>
                  <h2 className="text-lg font-medium">
                    Visualizar Escalas
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Ver escalas já cadastradas
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Relatório */}
          <Link href="/escalas/relatorio">
            <div className="
              bg-zinc-900
              border border-zinc-800
              rounded-2xl
              p-6
              hover:border-white
              hover:bg-zinc-800
              transition-all
              cursor-pointer
            ">
              <div className="flex items-center gap-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h2 className="text-lg font-medium">
                    Relatório de Escalas
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Análise e métricas das escalas
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Bloqueios */}
          <Link href="/escalas/bloqueios">
            <div className="
              bg-zinc-900
              border border-zinc-800
              rounded-2xl
              p-6
              hover:border-red-500
              hover:bg-zinc-800
              transition-all
              cursor-pointer
            ">
              <div className="flex items-center gap-4">
                <div className="text-3xl">🚫</div>
                <div>
                  <h2 className="text-lg font-medium">
                    Bloqueios
                  </h2>
                  <p className="text-sm text-zinc-400">
                    Gerenciar indisponibilidade de participantes
                  </p>
                </div>
              </div>
            </div>
          </Link>

        </div>

      </div>
    </main>
  );
}