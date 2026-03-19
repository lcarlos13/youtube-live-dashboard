import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY!;
const CHANNEL_ID = "UCw5-xj3AKqEizC7MvHaIPqA";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get("pageToken") || "";

  // pegar uploads playlist
  const channelRes = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
  );
  const channelData = await channelRes.json();

  const uploads =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // pegar playlist
  const playlistRes = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=20&pageToken=${pageToken}&key=${API_KEY}`
  );

  const playlistData = await playlistRes.json();

  const videoIds = playlistData.items.map(
    (v: any) => v.snippet.resourceId.videoId
  );

  const videosRes = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(
      ","
    )}&key=${API_KEY}`
  );

  const videosData = await videosRes.json();

  const durationMap: any = {};

  videosData.items.forEach((video: any) => {
    durationMap[video.id] = video.contentDetails.duration;
  });

  const shorts = playlistData.items
    .map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      duration: durationMap[item.snippet.resourceId.videoId]
    }))
    .filter((v: any) => {
      if (!v.duration) return false;

      const match = v.duration.match(/PT(\d+)S/);
      return match && parseInt(match[1]) <= 60;
    });

  return NextResponse.json({
    shorts,
    nextPageToken: playlistData.nextPageToken || null
  });
}