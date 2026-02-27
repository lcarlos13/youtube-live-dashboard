"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Video = {
  id: string
  title: string
  thumbnail: string
  publishedAt: string
  views: number
  comments: number
}

export default function TopPage() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    async function loadTop() {
      const res = await fetch("/api/top")
      const data = await res.json()
      setVideos(data.videos)
    }

    loadTop()
  }, [])

  return (
    <main className="bg-zinc-950 min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">
          🔥 Mais acessados do canal
        </h1>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {videos.map((video) => (
            <div key={video.id}>
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-3">
                <h2 className="text-sm md:text-base font-semibold line-clamp-2">
                  {video.title}
                </h2>

                <p className="text-xs text-gray-400 mt-1">
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

        <div className="flex justify-center mt-10">
          <Link
            href="/"
            className="bg-zinc-800 hover:bg-zinc-700 px-6 py-2 rounded-full transition"
          >
            ← Voltar para Lives
          </Link>
        </div>
      </div>
    </main>
  )
}