import { NextResponse } from "next/server"

const API_KEY = process.env.YOUTUBE_API_KEY!
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!

export async function GET() {
  // 🔥 1️⃣ Buscar top 5 por visualizações
  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=viewCount&type=video&maxResults=5&key=${API_KEY}`
  )

  const searchData = await searchRes.json()

  const videoIds = searchData.items
    .map((item: any) => item.id.videoId)
    .join(",")

  // 🔥 2️⃣ Buscar estatísticas completas
  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`,
    {
      next: { revalidate: 86400 } // 24h
    }
  )

  const videosData = await videosRes.json()

  const videos = searchData.items.map((item: any) => {
    const stats = videosData.items.find(
      (v: any) => v.id === item.id.videoId
    )

    return {
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      views: stats?.statistics?.viewCount || 0,
      comments: stats?.statistics?.commentCount || 0,
    }
  })

  return NextResponse.json({ videos })
}