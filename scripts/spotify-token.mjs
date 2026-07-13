// One-time helper: prints the SPOTIFY_REFRESH_TOKEN the widget needs.
// 1. Create an app at developer.spotify.com/dashboard with redirect URI
//    http://127.0.0.1:8888/callback
// 2. node scripts/spotify-token.mjs <client_id> <client_secret>
// 3. Open the printed URL, approve, copy the token it prints.

import http from 'node:http';

const [id, secret] = process.argv.slice(2);
if (!id || !secret) {
  console.error('usage: node scripts/spotify-token.mjs <client_id> <client_secret>');
  process.exit(1);
}
const REDIRECT = 'http://127.0.0.1:8888/callback';

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  if (u.pathname !== '/callback' || !u.searchParams.get('code')) { res.end(); return; }
  const tok = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: u.searchParams.get('code'),
      redirect_uri: REDIRECT,
    }),
  }).then((r) => r.json());
  res.end('done — check your terminal, you can close this tab');
  console.log('\nSPOTIFY_REFRESH_TOKEN=' + tok.refresh_token + '\n');
  server.close();
});

server.listen(8888, '127.0.0.1', () => {
  const auth = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: REDIRECT,
    scope: 'user-read-currently-playing user-read-recently-played',
  });
  console.log('open this in your browser:\n\n' + auth + '\n');
});
