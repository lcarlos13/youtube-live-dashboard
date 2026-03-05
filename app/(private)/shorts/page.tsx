"use client";

import { useEffect, useState } from "react";

export default function ShortsPage() {
  const [shorts, setShorts] = useState<any[]>([]);
  const [pageToken, setPageToken] = useState<string | null>(null);

  async function loadShorts(token?: string) {
    const res = await fetch(`/api/shorts?pageToken=${token || ""}`);
    const data = await res.json();

    setShorts((prev) => [...prev, ...data.shorts]);
    setPageToken(data.nextPageToken);
  }

  useEffect(() => {
    loadShorts();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center py-10 px-4">
      
      <div className="w-full max-w-md flex flex-col gap-8">

        {shorts.map((short, index) => {
          const date = new Date(short.publishedAt).toLocaleDateString("pt-BR");

          const prevDate =
            index > 0
              ? new Date(shorts[index - 1].publishedAt).toLocaleDateString("pt-BR")
              : null;

          const showDate = date !== prevDate;

          return (
            <div key={short.id} className="flex flex-col items-center gap-3">

              {showDate && (
                <div className="text-sm bg-zinc-800 px-4 py-1 rounded-full text-zinc-300 shadow">
                  📅 {date}
                </div>
              )}

              <div className="bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-800">
                <iframe
                  width="360"
                  height="640"
                  src={`https://www.youtube.com/embed/${short.id}`}
                  allowFullScreen
                  className="rounded-xl"
                />
              </div>

            </div>
          );
        })}

      </div>

      {pageToken && (
        <button
          onClick={() => loadShorts(pageToken)}
          className="mt-10 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition-all shadow-lg font-semibold"
        >
          ▶ Carregar mais
        </button>
      )}

    </div>
  );
}