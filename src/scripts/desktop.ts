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
const tick = () => {
  const now = new Date();
  const t = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  clock.textContent = t;
  if (wiiClock) wiiClock.textContent = t + '  ·  ' + now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};
tick();
setInterval(tick, 10000);

/* boot / turn off */
const boot = document.getElementById('boot')!;
const off = document.getElementById('off')!;
const offdlg = document.getElementById('offdlg')!;
const balloon = document.getElementById('balloon')!;
function bootUp() {
  boot.classList.remove('done');
  setTimeout(() => boot.classList.add('done'), 2400);
  setTimeout(() => { openWin('browser'); balloon.classList.add('on'); }, 3000);
  setTimeout(() => balloon.classList.remove('on'), 12000);
}
boot.onclick = () => boot.classList.add('done');
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
/* wii: launching a channel also closes the menu */
document.getElementById('wii')?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('.wii-channel:not(.wii-empty)')) document.getElementById('wii')!.classList.remove('on');
});
/* ps2: selecting a save loads its details + updates the highlighted title */
const ps2El = document.getElementById('ps2');
const ps2Title = document.getElementById('ps2-title');
ps2El?.querySelectorAll<HTMLElement>('.ps2-save').forEach((save) => {
  save.addEventListener('click', () => {
    ps2El.querySelectorAll('.ps2-save').forEach((s) => s.classList.remove('sel'));
    save.classList.add('sel');
    const k = save.dataset.save;
    ps2El.querySelectorAll<HTMLElement>('.ps2-detail').forEach((d) => d.classList.toggle('show', d.dataset.save === k));
    if (ps2Title && save.dataset.title) ps2Title.textContent = save.dataset.title;
  });
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

/* hit counter — counts this visitor's own visits, like the real thing never did */
const hits = document.getElementById('hits');
if (hits) {
  const n = (parseInt(localStorage.getItem('hits') ?? '4216', 10) || 4216) + 1;
  localStorage.setItem('hits', String(n));
  hits.textContent = String(n).padStart(6, '0');
}

/* boot once per session; skip the wait on return visits within the tab */
if (sessionStorage.getItem('xpBooted')) {
  boot.classList.add('done');
  openWin('browser');
} else {
  sessionStorage.setItem('xpBooted', '1');
  bootUp();
}
