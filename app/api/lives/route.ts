import { NextResponse } from "next/server"

const API_KEY = process.env.YOUTUBE_API_KEY!
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageToken = searchParams.get("pageToken") || ""
  const sort = searchParams.get("sort") || "recent"

  // 1️⃣ Pegar playlist de uploads
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
  )
  const channelData = await channelRes.json()

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads

  // 2️⃣ Buscar vídeos da playlist
  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=5&pageToken=${pageToken}&key=${API_KEY}`
  )
  const playlistData = await playlistRes.json()

  const videoIds = playlistData.items
    .map((item: any) => item.snippet.resourceId.videoId)
    .join(",")

  // 3️⃣ Buscar estatísticas
  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics,liveStreamingDetails&id=${videoIds}&key=${API_KEY}`
  )
  const videosData = await videosRes.json()

  const videos = playlistData.items.map((item: any) => {
    const stats = videosData.items.find(
      (v: any) => v.id === item.snippet.resourceId.videoId
    )

    return {
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      views: stats?.statistics?.viewCount || 0,
      comments: stats?.statistics?.commentCount || 0,
      isLive: !!stats?.liveStreamingDetails
    }
  })

  // 🔥 ORDENAR AQUI
  if (sort === "views") {
    videos.sort((a: { views: any }, b: { views: any }) => Number(b.views) - Number(a.views))
  }

  if (sort === "comments") {
    videos.sort((a: { comments: any }, b: { comments: any }) => Number(b.comments) - Number(a.comments))
  }

  return NextResponse.json({
    videos,
    nextPageToken: playlistData.nextPageToken || null
  })
}