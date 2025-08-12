import { Hono } from "hono";
import ytdl from "@distube/ytdl-core";

const app = new Hono();

app.get("/urls", async (c) => {
  const videoId = c.req.query("videoId");
  if (!videoId || !ytdl.validateID(videoId)) {
    return c.json({ error: "Missing or invalid videoId" }, 400);
  }

  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    const formats = info.formats;

    const audio = formats
      .filter((f) => f.mimeType?.includes("audio") && !f.mimeType?.includes("video"))
      .map((f) => ({
        url: f.url,
        quality: `${f.audioBitrate || Math.round(f.bitrate / 1000)}kbps`,
      }));

    const video = formats
      .filter((f) => f.mimeType?.includes("video") && f.qualityLabel)
      .map((f) => ({
        url: f.url,
        quality: f.qualityLabel,
      }));

    return c.json({ urls: { audio, video }});
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to fetch video info" }, 500);
  }
});

export default app;
