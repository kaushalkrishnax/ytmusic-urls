import express from 'express';
import ytdl from '@distube/ytdl-core';

const app = express();

app.get('/urls', async (req, res) => {
  const videoId = req.query.videoId;

  if (!videoId || !ytdl.validateID(videoId)) {
    return res.status(400).json({ error: 'Missing or invalid videoId' });
  }

  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    const formats = info.formats;

    const audio = {
      urls: formats
        .filter(f => f.mimeType?.includes('audio') && !f.mimeType?.includes('video'))
        .map(f => ({
          url: f.url,
          quality: `${f.audioBitrate || Math.round(f.bitrate / 1000)}kbps`
        }))
    };

    const video = {
      urls: formats
        .filter(f => f.mimeType?.includes('video') && f.qualityLabel)
        .map(f => ({
          url: f.url,
          quality: f.qualityLabel
        }))
    };

    res.json({ audio, video });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch video info' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
