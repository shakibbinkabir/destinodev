const CHANNEL_ID = 'UC9r_ugFs9RL4OkeEAwztQ7g';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function parseVideos(xml) {
  const entries = xml.split('<entry>').slice(1);

  return entries.map((entry) => {
    const get = (tag) => {
      const match = entry.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
      return match ? match[1].trim() : '';
    };
    const getAttr = (tag, attr) => {
      const match = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 's'));
      return match ? match[1] : '';
    };

    return {
      videoId: get('yt:videoId'),
      title: get('title'),
      published: get('published'),
      thumbnail: getAttr('media:thumbnail', 'url'),
      views: getAttr('media:community media:statistics', 'views'),
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const apiRes = await fetch(RSS_URL);

    if (!apiRes.ok) {
      throw new Error(`YouTube RSS responded with status ${apiRes.status}`);
    }

    const xml = await apiRes.text();
    const videos = parseVideos(xml);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    return res.json({
      success: true,
      data: {
        channelId: CHANNEL_ID,
        videos,
        fetchedAt: Date.now(),
      },
    });
  } catch (err) {
    console.error('[YouTubeFeed] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch YouTube feed.',
    });
  }
}
