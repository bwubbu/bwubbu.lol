// blubOS windowing + desktop behaviour. One script for the whole desktop:
// window management, start menu, context menu, boot/shutdown, blubamp polling.

let z = 10;
const taskbtns = document.getElementById('taskbtns')!;
const el = (id: string) => document.getElementById('win-' + id) as HTMLElement | null;

function focusWin(w: HTMLElement) {
  w.style.zIndex = String(++z);
  document.querySelectorAll('.win.active').forEach((o) => o !== w && o.classList.remove('active'));
  w.classList.add('active');
  document.querySelectorAll('.taskbtn').forEach((b) => b.classList.toggle('active', b.id === 'task-' + w.id.slice(4)));
}
function openWin(id: string) {
  const overlay = document.getElementById(id);
  if (overlay?.classList.contains('overlay')) { overlay.classList.add('on'); return; }
  const w = el(id);
  if (!w) return;
  w.classList.remove('min', 'minning');
  if (!w.classList.contains('open')) {
    w.classList.add('open');
    if (id !== 'error') addTaskbtn(id);
  }
  focusWin(w);
}
function minimizeWin(w: HTMLElement) {
  w.classList.remove('active');
  document.getElementById('task-' + w.id.slice(4))?.classList.remove('active');
  w.classList.add('minning');
  setTimeout(() => { w.classList.remove('minning'); w.classList.add('min'); }, 180);
}
function closeWin(w: HTMLElement) {
  w.classList.remove('open', 'min', 'minning', 'maxed', 'active');
  document.getElementById('task-' + w.id.slice(4))?.remove();
}
function addTaskbtn(id: string) {
  if (document.getElementById('task-' + id)) return;
  const w = el(id)!;
  const b = document.createElement('button');
  b.className = 'taskbtn active';
  b.id = 'task-' + id;
  const icon = w.querySelector('.ticon');
  const title = w.querySelector('.tbar h2')?.textContent ?? id;
  b.innerHTML = (icon ? icon.outerHTML : '') + '<span></span>';
  b.querySelector('span')!.textContent = title;
  b.onclick = () => {
    const win = el(id)!;
    if (win.classList.contains('min')) { win.classList.remove('min'); focusWin(win); }
    else if (win.classList.contains('active')) minimizeWin(win);
    else focusWin(win);
  };
  taskbtns.appendChild(b);
}
function showError(msg: string) {
  document.getElementById('err-msg')!.textContent = msg;
  openWin('error');
}
function activate(item: HTMLElement) {
  if (item.dataset.open) openWin(item.dataset.open);
  else if (item.dataset.err) showError(item.dataset.err);
}
const clearSel = () => document.querySelectorAll('.sel').forEach((s) => s.classList.remove('sel'));

const startmenu = document.getElementById('startmenu')!;
const ctx = document.getElementById('ctx')!;

/* single click = select; double click = open (desktop icons & explorer files) */
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const item = t.closest('.dicon, .file') as HTMLElement | null;
  if (item) {
    clearSel();
    item.classList.add('sel');
    if (e.detail === 0) activate(item); // keyboard (Enter/Space)
  } else if (!t.closest('.win, .startmenu, .taskbar, .balloon, .ctx')) {
    clearSel();
  }
  const opener = t.closest('[data-open]') as HTMLElement | null;
  if (opener && !opener.matches('.dicon, .file')) { openWin(opener.dataset.open!); startmenu.classList.remove('open'); }
  const errer = t.closest('[data-err]') as HTMLElement | null;
  if (errer && !errer.matches('.dicon, .file')) showError(errer.dataset.err!);
  const w = t.closest('.win') as HTMLElement | null;
  if (w) focusWin(w);
  if (t.closest('[data-close]')) closeWin(t.closest('.win') as HTMLElement);
  if (t.closest('[data-min]')) minimizeWin(t.closest('.win') as HTMLElement);
  if (t.closest('[data-max]')) (t.closest('.win') as HTMLElement).classList.toggle('maxed');
  if (!t.closest('#startmenu') && !t.closest('#startbtn')) startmenu.classList.remove('open');
  if (!t.closest('#ctx')) ctx.classList.remove('on');
});
document.addEventListener('dblclick', (e) => {
  const item = (e.target as HTMLElement).closest('.dicon, .file') as HTMLElement | null;
  if (item) activate(item);
});

/* drag windows (and the blubamp widget) by title bar */
document.querySelectorAll<HTMLElement>('.tbar').forEach((bar) => {
  bar.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('.wbtn')) return;
    const w = bar.closest('.win, .widget') as HTMLElement | null;
    if (!w || w.classList.contains('maxed')) return;
    focusWin(w);
    const r = w.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = (ev: PointerEvent) => {
      w.style.left = Math.max(-r.width + 90, Math.min(innerWidth - 90, ev.clientX - dx)) + 'px';
      w.style.top = Math.max(0, Math.min(innerHeight - 70, ev.clientY - dy)) + 'px';
      w.style.right = 'auto';
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });
});

/* start menu */
const startbtn = document.getElementById('startbtn')!;
startbtn.onclick = (e) => {
  e.stopPropagation();
  startbtn.setAttribute('aria-expanded', String(startmenu.classList.toggle('open')));
};
document.getElementById('allprog')!.onclick = () => {
  startmenu.classList.remove('open');
  showError("All Programs is not implemented. There are only, like, four programs. They're all on the desktop.");
};
document.getElementById('logoff')!.onclick = () => {
  startmenu.classList.remove('open');
  showError("You can't log off. You just got here.");
};

/* desktop context menu */
document.getElementById('scene')!.addEventListener('contextmenu', (e) => {
  if ((e.target as HTMLElement).closest('.win')) return;
  e.preventDefault();
  ctx.style.left = Math.min(e.clientX, innerWidth - 190) + 'px';
  ctx.style.top = Math.min(e.clientY, innerHeight - 200) + 'px';
  ctx.classList.add('on');
});
document.getElementById('ctx-refresh')!.onclick = () => ctx.classList.remove('on');
document.getElementById('ctx-props')!.onclick = () => {
  ctx.classList.remove('on');
  showError("Display Properties are locked. The wallpaper stays. It's a load-bearing hill.");
};

/* quick launch */
document.getElementById('showdesk')!.onclick = () =>
  document.querySelectorAll<HTMLElement>('.win.open:not(.min)').forEach(minimizeWin);

/* clock */
const clock = document.getElementById('clock')!;
const wiiClock = document.getElementById('wii-clock');
const wiiDate = document.getElementById('wii-date');
const tick = () => {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  // wii clock: 12h time with small AM/PM, blinking colon, weekday d/m date — like the real menu
  if (wiiClock) wiiClock.innerHTML =
    `${now.getHours() % 12 || 12}<b>:</b>${String(now.getMinutes()).padStart(2, '0')}<span>${now.getHours() < 12 ? 'AM' : 'PM'}</span>`;
  if (wiiDate) wiiDate.textContent = `${now.toLocaleDateString('en-GB', { weekday: 'short' })} ${now.getDate()}/${now.getMonth() + 1}`;
};
tick();
setInterval(tick, 10000);

/* boot / turn off */
const boot = document.getElementById('boot')!;
const off = document.getElementById('off')!;
const offdlg = document.getElementById('offdlg')!;
const balloon = document.getElementById('balloon')!;
const sticky = document.getElementById('sticky')!;
document.getElementById('stickyx')!.onclick = () => sticky.classList.remove('on');
function bootUp() {
  boot.classList.remove('done');
  setTimeout(() => boot.classList.add('done'), 2400);
  setTimeout(() => { sticky.classList.add('on'); balloon.classList.add('on'); }, 3000);
  setTimeout(() => balloon.classList.remove('on'), 12000);
}
document.getElementById('turnoff')!.onclick = () => { startmenu.classList.remove('open'); offdlg.classList.add('on'); };
document.getElementById('offcancel')!.onclick = () => offdlg.classList.remove('on');
offdlg.onclick = (e) => { if (e.target === offdlg) offdlg.classList.remove('on'); };
document.getElementById('poweroff')!.onclick = () => { offdlg.classList.remove('on'); off.classList.add('on'); };
document.getElementById('standby')!.onclick = () => { offdlg.classList.remove('on'); off.classList.add('on'); };
document.getElementById('restart')!.onclick = () => {
  offdlg.classList.remove('on');
  document.querySelectorAll<HTMLElement>('.win').forEach(closeWin);
  bootUp();
};
off.onclick = () => {
  off.classList.remove('on');
  document.querySelectorAll<HTMLElement>('.win').forEach(closeWin);
  bootUp();
};

/* balloon */
balloon.onclick = (e) => {
  balloon.classList.remove('on');
  if ((e.target as HTMLElement).id !== 'bx') openWin('wii');
};

/* overlays (wii channels, ps2 memory card): back buttons close them */
document.querySelectorAll<HTMLElement>('.overlay').forEach((ov) => {
  ov.querySelector('[data-overlay-close]')?.addEventListener('click', () => ov.classList.remove('on'));
});
/* wii: clicking a channel zooms into its banner page (FLIP: start the
   fullscreen page at the tile's rect, then release it to fill the screen).
   The banner holds the whole project; "Wii Menu" zooms back out. */
const wiiEl = document.getElementById('wii');
const wiiZoom = document.getElementById('wii-zoom');
if (wiiEl && wiiZoom) {
  const tileRect = (ch: HTMLElement) => {
    const r = ch.getBoundingClientRect();
    return `translate(${r.left}px, ${r.top}px) scale(${r.width / innerWidth}, ${r.height / innerHeight})`;
  };
  let lastChannel: HTMLElement | null = null;
  wiiEl.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const ch = t.closest('.wii-channel[data-zoom]') as HTMLElement | null;
    if (ch) {
      lastChannel = ch;
      wiiZoom.querySelectorAll<HTMLElement>('.wii-page').forEach((p) => p.classList.toggle('show', p.dataset.slug === ch.dataset.zoom));
      wiiZoom.style.transformOrigin = '0 0';
      wiiZoom.style.transition = 'none';
      wiiZoom.style.transform = tileRect(ch);
      void wiiZoom.offsetWidth; // flush so the zoom animates from the tile
      wiiZoom.style.transition = '';
      wiiEl.classList.add('zoomed');
      wiiZoom.style.transform = 'none';
    }
    if (t.closest('[data-wii-back]')) {
      if (lastChannel) wiiZoom.style.transform = tileRect(lastChannel);
      wiiEl.classList.remove('zoomed');
    }
  });
}
/* ps2: selecting a save loads it — big model left, details right.
   ◯ Back returns to the grid first, then exits to the desktop. */
const ps2El = document.getElementById('ps2');
const ps2Title = document.getElementById('ps2-title');
ps2El?.querySelectorAll<HTMLElement>('.ps2-save').forEach((save) => {
  save.addEventListener('click', () => {
    const k = save.dataset.save;
    ps2El.querySelectorAll<HTMLElement>('.ps2-view').forEach((v) => v.classList.toggle('show', v.dataset.save === k));
    ps2El.classList.add('viewing');
    if (ps2Title && save.dataset.title) ps2Title.textContent = save.dataset.title;
  });
});
document.getElementById('ps2-back')?.addEventListener('click', () => {
  if (ps2El!.classList.contains('viewing')) {
    ps2El!.classList.remove('viewing');
    if (ps2Title) ps2Title.textContent = 'Select a data file';
  } else {
    ps2El!.classList.remove('on');
  }
});

/* send mail */
document.getElementById('send')!.onclick = () => {
  const to = (document.getElementById('m-to') as HTMLInputElement).value;
  const sub = encodeURIComponent((document.getElementById('m-sub') as HTMLInputElement).value);
  const body = encodeURIComponent((document.getElementById('m-body') as HTMLTextAreaElement).value);
  location.href = `mailto:${to}?subject=${sub}&body=${body}`;
};

/* blubamp: poll the now-playing API; degrade to silence locally/unconfigured */
const widget = document.getElementById('widget')!;
const spTitle = document.getElementById('sp-title')!;
const spArtist = document.getElementById('sp-artist')!;
const spStatus = document.getElementById('sp-status')!;
const spArt = document.getElementById('sp-art') as HTMLImageElement;
const spPh = document.getElementById('sp-ph')!;
const spLink = document.getElementById('sp-link') as HTMLAnchorElement;
function renderSp(d: { isPlaying?: boolean; lastPlayed?: boolean; title?: string; artist?: string; albumArt?: string; url?: string }) {
  widget.classList.toggle('playing', !!d.isPlaying);
  spTitle.textContent = d.title ?? 'nothing playing rn';
  spArtist.textContent = d.artist ?? '(spotify is quiet)';
  spStatus.textContent = d.isPlaying ? '▶ now playing' : d.lastPlayed ? '⏸ last played' : '· silence ·';
  spArt.style.display = d.albumArt ? '' : 'none';
  spPh.style.display = d.albumArt ? 'none' : '';
  if (d.albumArt) spArt.src = d.albumArt;
  spLink.style.display = d.url ? '' : 'none';
  if (d.url) spLink.href = d.url;
}
async function pollSp() {
  try {
    const r = await fetch('/api/now-playing', { cache: 'no-store' });
    if (!r.ok) throw new Error();
    renderSp(await r.json());
  } catch {
    renderSp({});
  }
}
pollSp();
setInterval(pollSp, 30000);
document.getElementById('wmini')!.onclick = () => widget.classList.toggle('mini');

/* sparkle cursor trail on the homepage, throttled; skipped for reduced motion */
const webpage = document.getElementById('webpage')!;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let lastSpark = 0;
  webpage.addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (now - lastSpark < 70) return;
    lastSpark = now;
    const r = webpage.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'trail';
    s.textContent = '✦';
    s.style.left = e.clientX - r.left + webpage.scrollLeft + 'px';
    s.style.top = e.clientY - r.top + webpage.scrollTop + 'px';
    webpage.appendChild(s);
    setTimeout(() => s.remove(), 700);
  });
}

/* github data goes via /api/github (see api/github.js) so browsers never
   spend their own network's anonymous per-IP rate limit */
const gh = (path: string, params = '') =>
  fetch(`/api/github?path=${path}${params}`).then((r) => (r.ok ? r.json() : Promise.reject()));
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/* friend space: real github followers; the built-in weirdos stay if this fails */
const top8 = document.getElementById('top8');
if (top8?.dataset.user) {
  const u = top8.dataset.user;
  Promise.all([gh(`users/${u}`), gh(`users/${u}/followers`, '&per_page=8')])
    .then(([user, followers]: [{ followers: number }, { login: string; avatar_url: string; html_url: string }[]]) => {
      if (!followers.length) return;
      document.getElementById('fcount')!.textContent = String(user.followers);
      top8.innerHTML = followers.map((u) =>
        `<figure><figcaption>${u.login}</figcaption><a href="${u.html_url}" target="_blank" rel="noreferrer"><img src="${u.avatar_url}&s=144" alt="${u.login}" loading="lazy"></a></figure>`
      ).join('');
    })
    .catch(() => {});
}

/* friends comments: a github issue is the guestbook; fallback quacks stay if it fails */
const cmts = document.getElementById('cmts');
if (cmts?.dataset.issue) {
  const issue = `repos/${cmts.dataset.repo}/issues/${cmts.dataset.issue}`;
  Promise.all([gh(issue), gh(`${issue}/comments`, '&per_page=10')])
    .then(([issue, comments]: [{ comments: number }, { body: string; created_at: string; user: { login: string; avatar_url: string; html_url: string } }[]]) => {
      if (!comments.length) return;
      document.getElementById('cmt-shown')!.textContent = String(comments.length);
      document.getElementById('cmt-total')!.textContent = String(issue.comments);
      cmts.innerHTML = comments.map((c) => {
        const body = c.body.length > 300 ? c.body.slice(0, 300) + '…' : c.body;
        const date = new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        return `<tr><td class="who">${c.user.login}<br><a href="${c.user.html_url}" target="_blank" rel="noreferrer"><img src="${c.user.avatar_url}&s=120" alt=""></a></td><td class="what"><b>${date}</b><br><br>${esc(body)}</td></tr>`;
      }).join('');
    })
    .catch(() => {});
}

/* live sidebar details + avatar, straight from the github user record */
const GHDATE = (s: string, opts: Intl.DateTimeFormatOptions) => new Date(s).toLocaleDateString('en-GB', opts);
const LANGCOLOR: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572a5', HTML: '#e34c26',
  CSS: '#639', Astro: '#ff5a03', Go: '#00add8', Rust: '#dea584', Java: '#b07219',
  Kotlin: '#a97bff', Swift: '#f05138', Dart: '#00b4ab', 'C#': '#178600', 'C++': '#f34b7d',
};
const setText = (id: string, v: string | number) => { const n = document.getElementById(id); if (n) n.textContent = String(v); };
const av = document.getElementById('pavatar') as HTMLImageElement | null;
if (av?.dataset.user) {
  gh(`users/${av.dataset.user}`)
    .then((user: { created_at: string; public_repos: number; followers: number; following: number; avatar_url?: string }) => {
      if (user.avatar_url) {
        av.onerror = () => { av.onerror = null; av.src = '/profile-pic.jpg'; };
        av.src = `${user.avatar_url}&s=210`;
      }
      setText('gh-since', GHDATE(user.created_at, { month: 'short', year: 'numeric' }));
      setText('gh-repos', user.public_repos);
      setText('gh-followers', user.followers);
      setText('gh-following', user.following);
      setText('badge-followers', user.followers);
    })
    .catch(() => {});
}

/* pinned repos (graphql-only, the proxy exposes them as path=pinned) rendered
   as github-style cards; the joke ones stay if this fails */
const pinned = document.getElementById('pinned');
if (pinned) {
  gh('pinned')
    .then((pins: { name: string; html_url: string; stargazers_count: number; language: string | null; description: string | null }[]) => {
      if (!pins.length) return;
      pinned.innerHTML = pins.map((p) => {
        const c = LANGCOLOR[p.language ?? ''] ?? '#9bb8d4';
        return `<div class="pin"><a href="${p.html_url}" target="_blank" rel="noreferrer">${p.name}</a><p>${esc(p.description ?? '')}</p><small><i class="dot" style="background:${c}"></i> ${p.language ?? 'vibes'}${p.stargazers_count ? ` · ★ ${p.stargazers_count}` : ''}</small></div>`;
      }).join('');
    })
    .catch(() => {});
}

/* mood ring: public events become a 13-week heatmap. ponytail: one page of
   events (latest 100), weeks not aligned to sunday — it's a mood ring, not a
   spreadsheet; paginate if it ever reads too pale */
const mood = document.getElementById('moodgrid');
if (mood?.dataset.user) {
  const drawMood = (counts: Map<string, number>) => {
    let cells = '';
    for (let i = 90; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      const n = counts.get(d) ?? 0;
      cells += `<i data-lvl="${Math.min(n, 3)}" title="${d}: ${n} events"></i>`;
    }
    mood.innerHTML = cells;
  };
  drawMood(new Map());
  gh(`users/${mood.dataset.user}/events`, '&per_page=100')
    .then((events: { created_at: string }[]) => {
      const counts = new Map<string, number>();
      events.forEach((e) => { const d = e.created_at.slice(0, 10); counts.set(d, (counts.get(d) ?? 0) + 1); });
      drawMood(counts);
      const week = events.filter((e) => Date.now() - +new Date(e.created_at) < 7 * 864e5).length;
      setText('mood-now', week > 10 ? 'locked in' : week > 3 ? 'shipping' : week > 0 ? 'lurking' : 'touching grass');
    })
    .catch(() => {});
}

/* profile views badge — counts this visitor's own visits, like komarev never did */
const hits = document.getElementById('pviews');
if (hits) {
  const n = (parseInt(localStorage.getItem('hits') ?? '4216', 10) || 4216) + 1;
  localStorage.setItem('hits', String(n));
  hits.textContent = String(n);
}

/* boot once per session; skip the wait on return visits within the tab */
if (sessionStorage.getItem('xpBooted')) {
  boot.classList.add('done');
  openWin('browser');
} else {
  sessionStorage.setItem('xpBooted', '1');
  bootUp();
}
