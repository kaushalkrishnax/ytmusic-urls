import { Hono } from "hono";
import ytdl from "@ybd-project/ytdl-core";

const app = new Hono();

app.get("/url", async (c) => {
  const id = c.req.query("id");
  if (!id) return c.json({ error: "Missing id" }, 400);

  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
    const formats = ytdl.filterFormats(info.formats, "audioonly");

    return c.json({
      title: info.videoDetails.title,
      urls: formats.map(f => ({
        quality: f.audioQuality,
        mimeType: f.mimeType,
        url: f.url
      }))
    });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
