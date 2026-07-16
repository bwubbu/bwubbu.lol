// Vercel serverless function: proxies public GitHub reads for the site, so
// browsers never spend their network's anonymous 60/hr per-IP quota (shared
// office NATs exhaust it). Set GITHUB_TOKEN in Vercel env vars (no scopes
// needed, it's all public data) to raise the upstream limit to 5000/hr;
// without it the function still works, just on Vercel's own anonymous quota.
// Edge-cached 5 min, so GitHub sees a handful of requests per hour total.

// only blub's own public data; extend as about.html grows
const ALLOWED = /^(users\/bwubbu(\/followers|\/repos|\/events)?|repos\/bwubbu\/\w[\w.-]*(\/issues\/\d+(\/comments)?)?)$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  const path = String(req.query.path ?? '');
  const headers = { 'User-Agent': 'bwubbu.lol', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  // pinned repos only exist in the GraphQL API, which requires the token
  if (path === 'pinned') {
    if (!process.env.GITHUB_TOKEN) return res.status(501).json({ error: 'GITHUB_TOKEN required for pinned repos' });
    try {
      const query = '{ user(login: "bwubbu") { pinnedItems(first: 6, types: REPOSITORY) { nodes { ... on Repository { name url description stargazerCount primaryLanguage { name } } } } } }';
      const r = await fetch('https://api.github.com/graphql', { method: 'POST', headers, body: JSON.stringify({ query }) });
      const nodes = (await r.json())?.data?.user?.pinnedItems?.nodes ?? [];
      return res.status(200).json(nodes.map((n) => ({
        name: n.name, html_url: n.url, description: n.description ?? null, stargazers_count: n.stargazerCount, language: n.primaryLanguage?.name ?? null,
      })));
    } catch {
      return res.status(502).json({ error: 'github unreachable' });
    }
  }

  if (!ALLOWED.test(path)) return res.status(400).json({ error: 'path not allowed' });

  const per = Math.min(parseInt(req.query.per_page, 10) || 0, 100);
  const url = `https://api.github.com/${path}${per ? `?per_page=${per}` : ''}`;

  try {
    const r = await fetch(url, { headers });
    if (!r.ok) return res.status(r.status).json({ error: `github said ${r.status}` });
    return res.status(200).json(await r.json());
  } catch {
    return res.status(502).json({ error: 'github unreachable' });
  }
}
