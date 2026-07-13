// Vercel serverless function: reports what Blub is playing on Spotify.
// Needs SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN env vars
// (see README "Spotify widget"). Always answers 200 — the widget treats any
// shape it doesn't recognise as "nothing playing".

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

function shape(item, isPlaying) {
  return {
    isPlaying,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    album: item.album?.name,
    albumArt: item.album?.images?.at(-1)?.url, // smallest image; widget shows 44px
    url: item.external_urls?.spotify,
  };
}

export default async function handler(req, res) {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
  if (!id || !secret || !refresh) return res.status(200).json({ isPlaying: false, configured: false });

  try {
    const auth = 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
    const tok = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    }).then((r) => r.json());
    const bearer = { Authorization: `Bearer ${tok.access_token}` };

    const now = await fetch(NOW_URL, { headers: bearer });
    if (now.status === 200) {
      const d = await now.json();
      if (d?.item) return res.status(200).json(shape(d.item, d.is_playing));
    }

    // nothing on: fall back to the last played track
    const rec = await fetch(RECENT_URL, { headers: bearer });
    if (rec.status === 200) {
      const track = (await rec.json()).items?.[0]?.track;
      if (track) return res.status(200).json({ ...shape(track, false), lastPlayed: true });
    }
    return res.status(200).json({ isPlaying: false });
  } catch {
    return res.status(200).json({ isPlaying: false });
  }
}
