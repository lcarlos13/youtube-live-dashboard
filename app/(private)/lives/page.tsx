"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Home() {
  const [videos, setVideos] = useState<any[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [sortType, setSortType] = useState("recent")

  async function loadVideos(pageToken?: string | null) {
    const res = await fetch(
      `/api/lives${
        pageToken ? `?pageToken=${pageToken}` : ""
      }`
    )

    const data = await res.json()

    const updated = [...videos, ...data.videos]

    setVideos(updated)

    if (sortType !== "recent") {
      sortVideos(sortType)
    }

    setNextPageToken(data.nextPageToken)
  }

  useEffect(() => {
    loadVideos()
  }, [])

  function handleSort(type: string) {
    setSortType(type)
  }

  function sortVideos(type: string) {
    const sorted = [...videos] // copia o array

    if (type === "views") {
      sorted.sort((a, b) => Number(b.views) - Number(a.views))
    }

    if (type === "comments") {
      sorted.sort((a, b) => Number(b.comments) - Number(a.comments))
    }

    if (type === "recent") {
      sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
    }

    setVideos(sorted)
    setSortType(type)
  }

  return (
    <main className="bg-zinc-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Lives
          </h1>

          {/* Container dos botões */}
          <div className="flex items-center gap-4">
            <Link href="/top">
              <button className="
                flex items-center gap-2
                border border-neutral-300
                px-4 py-2
                rounded-full
                text-sm font-medium
                hover:bg-black hover:text-white
                transition-colors
              ">
                🔥 Top 5 - Mais acessados do canal
              </button>
            </Link>
          </div>
        </div>

        <div className="flex gap-4 mt-6 mb-8 flex-wrap">
          <button
            onClick={() => sortVideos("recent")}
            className={`px-4 py-2 rounded-full transition border 
              ${
                sortType === "recent"
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
          >
            Mais recentes
          </button>

          <button
            onClick={() => sortVideos("views")}
            className={`px-4 py-2 rounded-full transition border 
              ${
                sortType === "views"
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
          >
            Mais visualizações
          </button>

          <button
            onClick={() => sortVideos("comments")}
            className={`px-4 py-2 rounded-full transition border 
              ${
                sortType === "comments"
                  ? "bg-white text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
          >
            Mais comentários
          </button>
        </div>

        

        {/* GRID RESPONSIVO */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <div key={video.id} className="cursor-pointer">
              {/* Thumbnail menor */}
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>

              {/* Conteúdo abaixo da imagem */}
              <div className="mt-3">
                <h2 className="text-sm md:text-base font-semibold line-clamp-2">
                  {video.title}
                </h2>

                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  👁 {Number(video.views).toLocaleString()} • 💬{" "}
                  {Number(video.comments).toLocaleString()}
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botão carregar mais */}
        {nextPageToken && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => loadVideos(nextPageToken)}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-full transition"
            >
              Carregar mais
            </button>
          </div>
        )}
      </div>
    </main>
  )
}