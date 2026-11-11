import { createStore, local } from './store.js';
import { APP_VERSION } from './version.js';

/* ═════════════════ Utilitaires ═════════════════ */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeCode = () => Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');

const pad = (n) => String(n).padStart(2, '0');
const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a, b) => Math.round((fromKey(b) - fromKey(a)) / 86400000);
const fmt = (k, o = { day: 'numeric', month: 'short' }) => fromKey(k).toLocaleDateString('fr-FR', o);
const fmtRange = (a, b) => a === b ? fmt(a, { weekday: 'short', day: 'numeric', month: 'short' }) : `${fmt(a, { weekday: 'short', day: 'numeric' })} → ${fmt(b, { weekday: 'short', day: 'numeric', month: 'short' })}`;
const periodDays = (t) => { const out = []; let d = fromKey(t.start); const end = fromKey(t.end); while (d <= end && out.length < 200) { out.push(toKey(d)); d = addDays(d, 1); } return out; };

const AVATAR_COLORS = [['#7b2ff7', '#3a1479'], ['#ff2e97', '#a3105c'], ['#cdb4ff', '#4b1d96'], ['#ff2e97', '#7b2ff7'], ['#cdb4ff', '#7b2ff7'], ['#ff6cb6', '#ff2e97'], ['#c9a227', '#7a5c00'], ['#cdb4ff', '#ff2e97']];
const KIT = 'linear-gradient(90deg,#3a1479 0 35%,#fff 35% 38%,#ff2e97 38% 62%,#fff 62% 65%,#3a1479 65%)';
const COVERS = [KIT, 'linear-gradient(135deg,#7b2ff7,#3a1479)', 'linear-gradient(135deg,#ff2e97,#3a1479)', 'linear-gradient(135deg,#3a1479,#7b2ff7 60%,#ff2e97)', 'linear-gradient(135deg,#ff2e97,#a3105c)', 'linear-gradient(160deg,#3a1479 0 55%,#ff2e97 55%)'];
const EMOJIS = ['🏖️', '🏔️', '🏕️', '🌴', '🏙️', '🍷', '🎿', '🚐', '🏝️', '🎉', '🌋', '🏄', '🛶', '🗼', '🌲', '🍕'];

const initials = (n = '?') => n.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
const avatar = (m, cls = '') => {
  const c = AVATAR_COLORS[(m?.color ?? 0) % AVATAR_COLORS.length];
  return `<span class="avatar ${cls}" style="--c1:${c[0]};--c2:${c[1]}" title="${esc(m?.name)}">${esc(initials(m?.name))}</span>`;
};

const I = {
  logo: '<svg viewBox="0 0 48 48" fill="none"><path d="M3 40 17 17l8 11 6-8 14 20z" fill="#fff"/><path d="m17 17 4 6.5-4 3-3.5-3z" fill="#3a1479" opacity=".55"/><circle cx="35" cy="11" r="5.5" fill="#fff"/></svg>',
  euro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6.5A7 7 0 1 0 18 17.5"/><path d="M4 10h10M4 14h10"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3M17 6l3 3M15 8l2 2"/></svg>',
  rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7z"/></svg>',
};

/* ═════════════════ État ═════════════════ */
const state = {
  me: local.get('bw:me'),
  myTrips: local.get('bw:mytrips', []),
  screen: 'home',
  code: null,
  trip: null,
  tab: 'dates',
  calMode: 'mine',
  unsub: null,
  cache: {},
};
let store;

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200);
}
function saveMyTrips() { local.set('bw:mytrips', state.myTrips); syncDevice(); }

/* Journal des nouveautés : lu par le notificateur (GitHub Actions) pour prévenir les autres potes.
   key fixe par sujet (ex. « av_<uid> ») pour qu'une série de modifs ne produise qu'une notif. */
function feed(key, type, text) {
  const at = Date.now();
  return { [`feed.${key}`]: { by: state.me.id, name: state.me.name, type, text: String(text).slice(0, 140), at }, feedAt: at };
}

/* ═════════════════ Logique métier ═════════════════ */
function dayScore(trip, k) {
  let yes = 0, maybe = 0;
  for (const id of Object.keys(trip.members || {})) {
    const s = trip.avail?.[id]?.[k];
    if (s === 'yes') yes++; else if (s === 'maybe') maybe++;
  }
  return { yes, maybe, score: yes + maybe * 0.5 };
}

function bestWindow(trip) {
  const days = periodDays(trip);
  const n = Object.keys(trip.members || {}).length;
  if (!days.length || !n) return null;
  const sc = days.map((k) => dayScore(trip, k).score);
  if (Math.max(...sc) === 0) return null;
  let best = null;
  const minL = days.length >= 2 ? 2 : 1;
  for (let L = Math.min(days.length, 14); L >= minL; L--) {
    for (let i = 0; i + L <= days.length; i++) {
      const v = Math.min(...sc.slice(i, i + L));
      const avg = sc.slice(i, i + L).reduce((a, b) => a + b, 0) / L;
      if (!best || v > best.v || (v === best.v && L > best.L) || (v === best.v && L === best.L && avg > best.avg)) best = { i, L, v, avg };
    }
  }
  if (!best || best.v === 0) {
    const i = sc.indexOf(Math.max(...sc));
    best = { i, L: 1, v: sc[i] };
  }
  return { start: days[best.i], end: days[best.i + best.L - 1], len: best.L, avail: best.v, total: n, keys: days.slice(best.i, best.i + best.L) };
}

function detectSource(url) {
  try {
    const h = new URL(url).hostname.replace(/^www\./, '');
    if (h.includes('airbnb')) return { k: 'airbnb', label: 'Airbnb', ic: '🏡' };
    if (h.includes('booking')) return { k: 'booking', label: 'Booking', ic: '🏨' };
    if (h.includes('abritel') || h.includes('vrbo')) return { k: 'abritel', label: 'Abritel', ic: '🏠' };
    if (h.includes('gites') || h.includes('leboncoin')) return { k: 'other', label: h, ic: '🛖' };
    return { k: 'other', label: h, ic: '🔗' };
  } catch { return { k: 'other', label: 'Lien', ic: '🔗' }; }
}
function guessTitle(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/rooms\/(\d+)/);
    if (m) return `Logement Airbnb #${m[1].slice(-5)}`;
    const seg = u.pathname.split('/').filter(Boolean).pop() || '';
    const clean = decodeURIComponent(seg).replace(/\.(html?|php)$/, '').replace(/[-_]+/g, ' ').replace(/\b\d{4,}\b/g, '').trim();
    return clean.length > 3 ? clean.charAt(0).toUpperCase() + clean.slice(1) : `Logement ${detectSource(url).label}`;
  } catch { return 'Logement'; }
}

/* ═════════════════ Rendu ═════════════════ */
function render() {
  const app = $('#app');
  if (!state.me) return app.innerHTML = viewOnboarding();
  if (state.screen === 'trip' && state.trip) app.innerHTML = viewTrip();
  else app.innerHTML = viewHome();
}

function viewOnboarding() {
  const sel = state._color ?? 0;
  return `<section class="screen">
    <div class="hero-logo">
      <div class="logo-mark">${I.logo}</div>
      <div class="brand"><span class="grad-text">Tripizi</span></div>
      <p class="tagline">Les escapades entre potes, sans le chaos du groupe WhatsApp.</p>
    </div>
    <div class="glass stack" style="padding:20px">
      <div class="field"><label>Ton pseudo</label><input class="input" id="ob-name" maxlength="20" placeholder="Ex : Léa" autocomplete="off"></div>
      <div class="field"><label>Ta couleur</label>
        <div class="colors">${AVATAR_COLORS.map((c, i) => `<button class="color-pick ${i === sel ? 'on' : ''}" data-act="pick-color" data-i="${i}" style="background:linear-gradient(135deg,${c[0]},${c[1]})" aria-label="Couleur ${i + 1}"></button>`).join('')}</div>
      </div>
      <button class="btn btn-primary btn-block" data-act="onboard">C'est parti ${I.rocket.replace('<svg', '<svg width="18" height="18"')}</button>
    </div>
  </section>`;
}

function tripCard(code) {
  const t = state.cache[code];
  if (!t) return '';
  const n = Object.keys(t.members || {}).length;
  const best = bestWindow(t);
  const members = Object.values(t.members || {}).slice(0, 5);
  return `<button class="glass trip-card" data-act="open" data-code="${code}" style="width:100%;text-align:left">
    <div class="trip-cover" style="--cover:${COVERS[t.cover ?? 0]}"><span class="emoji">${t.emoji || '🌍'}</span><h3>${esc(t.name)}</h3></div>
    <div class="trip-body">
      <div class="trip-meta">
        <span>📍 ${esc(t.destination || 'Destination à définir')}</span>
        ${best ? `<span class="chip lime" style="width:max-content"><span class="dot"></span>${fmtRange(best.start, best.end)}</span>` : `<span>${fmt(t.start)} – ${fmt(t.end)}</span>`}
      </div>
      <div style="text-align:right"><div class="avatars" style="justify-content:flex-end">${members.map((m) => avatar(m, 'sm')).join('')}</div><small class="muted">${n} pote${n > 1 ? 's' : ''}</small></div>
    </div>
  </button>`;
}

function viewHome() {
  const codes = state.myTrips.filter((c) => state.cache[c]);
  return `<section class="screen">
    <div class="topbar">
      <div class="mini-brand"><span class="mk">${I.logo}</span>Tripizi</div>
      <button data-act="edit-me">${avatar(state.me)}</button>
    </div>
    <div class="greet"><span class="eyebrow">Salut ${esc(state.me.name)} 👋</span><h1>Où part<br><span class="grad-text">la bande</span> ?</h1></div>
    <div class="actions-2">
      <button class="glass action-tile primary" data-act="new"><span class="ic">${I.plus}</span><span><b>Nouvelle escapade</b><small>Dates, logements, potes</small></span></button>
      <button class="glass action-tile" data-act="join"><span class="ic">${I.key}</span><span><b>Rejoindre</b><small>Avec un code à 6 lettres</small></span></button>
    </div>
    <div class="section-h"><span class="eyebrow">Mes escapades</span><span class="chip">${codes.length}</span></div>
    ${codes.length ? codes.map(tripCard).join('') : `<div class="glass empty"><div class="big">🧭</div><h3>Aucune escapade pour l'instant</h3><p>Crée ton premier voyage et partage le code à ta bande.</p></div>`}
    <button class="glass feedback-cta" data-act="feedback"><span class="ic">💬</span><span><b>Une idée pour améliorer Tripizi ?</b><small>Propose une amélioration ou signale un bug</small></span><span class="go">›</span></button>
    ${store.mode === 'local' ? `<div class="glass mode-banner">⚡<span><b>Mode démo local.</b> Les données restent sur ce téléphone. Ajoute ta config Firebase (voir README) pour synchroniser avec tes amis en temps réel.</span></div>` : ''}
  </section>`;
}

function viewTrip() {
  const t = state.trip;
  const links = Object.values(t.links || {});
  const exps = Object.values(t.expenses || {}).filter((e) => e.type !== 'transfer').length;
  return `<section class="screen">
    <div class="trip-hero">
      <div class="bar">
        <button class="icon-btn" data-act="home" aria-label="Retour">${I.back}</button>
        <div class="row">
          <button class="icon-btn" data-act="edit-trip" aria-label="Modifier">${I.edit}</button>
          <button class="icon-btn" data-act="share" aria-label="Partager">${I.share}</button>
        </div>
      </div>
      <div class="trip-title" style="--cover:${COVERS[t.cover ?? 0]}">
        <div class="em">${t.emoji || '🌍'}</div>
        <div><h1>${esc(t.name)}</h1><p>📍 ${esc(t.destination || 'Destination à définir')} · ${fmt(t.start)} – ${fmt(t.end, { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
      </div>
      <button class="code-pill" data-act="share">${t.code}<span class="s">Inviter</span></button>
    </div>
    <nav class="glass tabs">
      <button class="tab ${state.tab === 'dates' ? 'on' : ''}" data-act="tab" data-tab="dates">${I.cal}Dates</button>
      <button class="tab ${state.tab === 'stays' ? 'on' : ''}" data-act="tab" data-tab="stays">${I.home}Logements${links.length ? `<span class="n">${links.length}</span>` : ''}</button>
      <button class="tab ${state.tab === 'money' ? 'on' : ''}" data-act="tab" data-tab="money">${I.euro}Dépenses${exps ? `<span class="n">${exps}</span>` : ''}</button>
      <button class="tab ${state.tab === 'crew' ? 'on' : ''}" data-act="tab" data-tab="crew">${I.users}Bande</button>
    </nav>
    ${state.tab === 'dates' ? viewDates(t) : state.tab === 'stays' ? viewStays(t) : state.tab === 'money' ? viewMoney(t) : viewCrew(t)}
  </section>
  ${state.tab === 'stays' ? `<button class="fab" data-act="add-link">${I.plus}Ajouter un lien</button>` : ''}
  ${state.tab === 'money' && Object.keys(t.expenses || {}).length ? `<button class="fab" data-act="add-exp">${I.plus}Ajouter une dépense</button>` : ''}`;
}

function viewDates(t) {
  const best = bestWindow(t);
  const days = periodDays(t);
  const mine = t.avail?.[state.me.id] || {};
  const n = Object.keys(t.members || {}).length;
  const filled = Object.keys(mine).length;
  const bestSet = new Set(best?.keys || []);

  const months = [];
  for (const k of days) {
    const d = fromKey(k), mk = `${d.getFullYear()}-${d.getMonth()}`;
    if (!months.length || months[months.length - 1].mk !== mk) months.push({ mk, label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), days: [] });
    months[months.length - 1].days.push(k);
  }
  const monthHtml = months.map((m) => {
    const first = fromKey(m.days[0]);
    const offset = (first.getDay() + 6) % 7;
    const cells = Array(offset).fill('<div class="day out"></div>');
    for (const k of m.days) {
      const { yes, maybe, score } = dayScore(t, k);
      const ratio = n ? score / n : 0;
      const bd = bestSet.has(k) ? ' best-day' : '';
      if (state.calMode === 'mine') {
        const s = mine[k] || '';
        cells.push(`<button class="day ${s}${bd}" data-act="day" data-k="${k}">${fromKey(k).getDate()}<span class="heat"><i style="width:${ratio * 100}%"></i></span></button>`);
      } else {
        const bg = ratio === 0 ? '' : `background:rgba(182,255,59,${0.08 + ratio * 0.82});${ratio > .55 ? 'color:#0d081c;border-color:transparent;' : ''}`;
        cells.push(`<button class="day${bd}" style="${bg}" data-act="day-info" data-k="${k}">${fromKey(k).getDate()}<span class="cnt" ${ratio > .55 ? 'style="color:#04101fcc"' : ''}>${yes}${maybe ? `+${maybe}` : ''}/${n}</span></button>`);
      }
    }
    return `<div class="month-label">${m.label}</div><div class="wk">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<div class="h">${d}</div>`).join('')}${cells.join('')}</div>`;
  }).join('');

  // Tous les jours où au moins un pote est dispo, du plus demandé au moins demandé (à égalité : ordre chronologique)
  const rankedAll = days.map((k, i) => ({ k, i, ...dayScore(t, k) })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || a.i - b.i);
  const TOP = 7;
  const ranked = state.allDays ? rankedAll : rankedAll.slice(0, TOP);

  return `
    ${best ? `<div class="glass best">
      <span class="eyebrow" style="color:var(--lime)">${I.spark.replace('<svg', '<svg width="12" height="12" style="vertical-align:-1px"')} Meilleur créneau</span>
      <div class="big">${fmtRange(best.start, best.end)}</div>
      <div class="sub">${best.len} jour${best.len > 1 ? 's' : ''} · ${Number.isInteger(best.avail) ? best.avail : best.avail.toFixed(1)} / ${best.total} potes dispos tout du long</div>
      <div class="meter"><i style="width:${(best.avail / best.total) * 100}%"></i></div>
    </div>` : `<div class="glass best"><span class="eyebrow" style="color:var(--lime)">Meilleur créneau</span><div class="big">En attente des dispos…</div><div class="sub">Chacun coche ses jours, Tripizi trouve le créneau idéal.</div></div>`}
    <div class="glass cal">
      <div class="mode-switch">
        <button class="${state.calMode === 'mine' ? 'on' : ''}" data-act="cal-mode" data-m="mine">Mes dispos ${filled ? `(${filled})` : ''}</button>
        <button class="${state.calMode === 'group' ? 'on' : ''}" data-act="cal-mode" data-m="group">Vue de la bande</button>
      </div>
      ${state.calMode === 'mine'
        ? `<div class="legend" style="margin-top:14px"><span><i style="background:var(--lime)"></i>Dispo</span><span><i style="background:var(--amber)"></i>Peut-être</span><span><i style="background:var(--red)"></i>Pas dispo</span><span class="muted">· touche pour changer</span></div>`
        : `<div class="legend" style="margin-top:14px"><span><i style="background:rgba(182,255,59,.15)"></i>Peu</span><span><i style="background:rgba(182,255,59,.55)"></i>Moyen</span><span><i style="background:var(--lime)"></i>Tout le monde</span></div>`}
      ${monthHtml}
      ${state.calMode === 'mine' ? `<div class="quick">
        <button class="btn btn-ghost btn-sm" data-act="quick" data-q="all">✓ Tout dispo</button>
        <button class="btn btn-ghost btn-sm" data-act="quick" data-q="we">Week-ends</button>
        <button class="btn btn-ghost btn-sm" data-act="quick" data-q="clear">Effacer</button>
      </div>` : ''}
    </div>
    ${ranked.length ? `<div class="section-h"><span class="eyebrow">Top des jours</span></div>
    <div class="glass people-day">${ranked.map((r) => {
      const who = Object.entries(t.members).filter(([id]) => t.avail?.[id]?.[r.k] === 'yes').map(([, m]) => m);
      return `<div class="pd-row"><span class="d">${fmt(r.k, { weekday: 'short', day: 'numeric', month: 'short' })}</span><span class="bar"><i style="width:${(r.score / n) * 100}%"></i></span><span class="avatars">${who.slice(0, 4).map((m) => avatar(m, 'sm')).join('')}</span></div>`;
    }).join('')}${rankedAll.length > TOP ? `<button class="btn btn-ghost btn-sm" data-act="all-days" style="width:100%;margin-top:10px">${state.allDays ? 'Voir moins' : `Voir les ${rankedAll.length} jours`}</button>` : ''}</div>` : ''}`;
}

function viewStays(t) {
  const n = Math.max(1, Object.keys(t.members || {}).length);
  // Nuits de l'escapade : du jour d'arrivée (début) au jour de départ (fin)
  const nights = t.start && t.end ? Math.max(1, Math.round((fromKey(t.end) - fromKey(t.start)) / 864e5)) : 1;
  const links = Object.values(t.links || {}).sort((a, b) => Object.keys(b.votes || {}).length - Object.keys(a.votes || {}).length || a.at - b.at);
  if (!links.length) return `<div class="glass empty"><div class="big">🏡</div><h3>Aucun logement proposé</h3><p>Colle un lien Airbnb, Booking ou Abritel.<br>La bande vote, le meilleur remonte en tête.</p><div class="spacer"></div><button class="btn btn-primary" data-act="add-link">${I.plus.replace('<svg', '<svg width="18" height="18"')}Proposer un logement</button></div>`;
  return links.map((l, i) => {
    const src = detectSource(l.url);
    const votes = Object.keys(l.votes || {});
    const voted = votes.includes(state.me.id);
    const by = t.members?.[l.by];
    const total = l.priceType === 'night' ? l.price * nights : l.price;
    return `<article class="glass stay">
      <div class="stay-top">
        <div class="stay-thumb ${src.k}">${src.ic}${i === 0 && votes.length ? '<span class="rank">1</span>' : ''}</div>
        <div class="stay-info">
          <h3>${esc(l.title)}</h3>
          <div class="src">${src.label} · proposé par ${esc(by?.name || '?')}${l.editedAt ? ' · modifié' : ''}</div>
          ${l.price ? `<div class="prices">
            <span class="chip">${l.price} € ${l.priceType === 'night' ? '/ nuit' : 'total'}</span>
            ${l.priceType === 'night' ? `<span class="chip">${nights} nuit${nights > 1 ? 's' : ''} · ${Math.round(total)} €</span>` : ''}
            ${total ? `<span class="chip neon">≈ ${Math.round(total / n)} € / pers.</span>` : ''}
          </div>` : ''}
        </div>
      </div>
      ${l.note ? `<div class="stay-note">${esc(l.note)}</div>` : ''}
      <div class="stay-foot">
        <div class="row">
          <button class="vote ${voted ? 'on' : ''}" data-act="vote" data-id="${l.id}">${I.heart}${votes.length}</button>
          <span class="avatars">${votes.slice(0, 4).map((id) => avatar(t.members?.[id], 'sm')).join('')}</span>
        </div>
        <div class="row" style="gap:6px">
          <button class="icon-btn" data-act="edit-link" data-id="${l.id}" aria-label="Modifier" style="width:38px;height:38px">${I.edit}</button>
          ${l.by === state.me.id ? `<button class="icon-btn" data-act="del-link" data-id="${l.id}" aria-label="Supprimer" style="width:38px;height:38px">${I.trash}</button>` : ''}
          <a class="btn btn-ghost btn-sm" href="${esc(l.url)}" target="_blank" rel="noopener">Voir ${I.ext.replace('<svg', '<svg width="15" height="15"')}</a>
        </div>
      </div>
    </article>`;
  }).join('');
}

function viewCrew(t) {
  const days = periodDays(t);
  const members = Object.entries(t.members || {});
  return `<div class="glass" style="padding:4px 0">${members.map(([id, m]) => {
    const av = t.avail?.[id] || {};
    const y = days.filter((k) => av[k] === 'yes').length;
    const filled = days.filter((k) => av[k]).length;
    return `<div class="member">${avatar(m)}<div style="flex:1"><div class="nm">${esc(m.name)}${id === state.me.id ? '<span class="you">TOI</span>' : ''}${id === t.owner ? ' 👑' : ''}</div>
      <div class="st">${filled ? `${y} jour${y > 1 ? 's' : ''} dispo · ${filled}/${days.length} renseignés` : 'N’a pas encore rempli ses dispos'}</div></div>
      ${filled ? '<span class="chip lime"><span class="dot"></span>OK</span>' : '<span class="chip">⏳</span>'}</div>`;
  }).join('')}</div>
  <div class="spacer"></div>
  <div class="glass" style="padding:18px;text-align:center">
    <span class="eyebrow">Code d'invitation</span>
    <div style="font-family:var(--font-d);font-size:38px;font-weight:700;letter-spacing:.2em;margin:8px 0 14px" class="grad-text">${t.code}</div>
    <button class="btn btn-primary btn-block" data-act="share">${I.share.replace('<svg', '<svg width="18" height="18"')}Inviter la bande</button>
  </div>
  <div class="spacer"></div>
  <button class="btn btn-ghost btn-block danger" data-act="leave">Quitter cette escapade</button>`;
}


/* ═════════════════ Dépenses (principe Tricount) ═════════════════
   Chaque dépense : un payeur, une liste de participants, partage à parts égales.
   Solde d'une personne = ce qu'elle a payé − sa part de chaque dépense.
   Les remboursements sont simplifiés : le plus gros débiteur rembourse
   le plus gros créancier, et ainsi de suite (nombre minimal de virements). */
const EXP_CATS = [['🛒', 'Courses'], ['🍽️', 'Resto'], ['🏠', 'Logement'], ['🚗', 'Transport'], ['⛽', 'Essence'], ['🍻', 'Soirée'], ['🎟️', 'Activité'], ['💸', 'Autre']];
const euro = (c) => (c / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const toCents = (v) => Math.round(parseFloat(String(v).replace(/\s/g, '').replace(',', '.')) * 100);

function splitShares(amount, ids) {
  const parts = [...ids].sort();
  const base = Math.floor(amount / parts.length);
  let rest = amount - base * parts.length;
  return parts.map((id) => [id, base + (rest-- > 0 ? 1 : 0)]);
}

function computeBalances(t) {
  const bal = {}, paid = {}, owed = {};
  const touch = (id) => { if (!(id in bal)) { bal[id] = 0; paid[id] = 0; owed[id] = 0; } };
  Object.keys(t.members || {}).forEach(touch);
  let total = 0;
  for (const e of Object.values(t.expenses || {})) {
    const ids = (e.for || []).filter(Boolean);
    if (!ids.length || !e.amount) continue;
    touch(e.by); ids.forEach(touch);
    bal[e.by] += e.amount;
    if (e.type !== 'transfer') { paid[e.by] += e.amount; total += e.amount; }
    for (const [id, share] of splitShares(e.amount, ids)) {
      bal[id] -= share;
      if (e.type !== 'transfer') owed[id] += share;
    }
  }
  return { bal, paid, owed, total };
}

function settlements(bal) {
  const deb = Object.entries(bal).filter(([, v]) => v < 0).map(([id, v]) => ({ id, v: -v }));
  const cre = Object.entries(bal).filter(([, v]) => v > 0).map(([id, v]) => ({ id, v }));
  const out = [];
  while (deb.length && cre.length) {
    deb.sort((a, b) => b.v - a.v); cre.sort((a, b) => b.v - a.v);
    const d = deb[0], c = cre[0], x = Math.min(d.v, c.v);
    if (x > 0) out.push({ from: d.id, to: c.id, amount: x });
    d.v -= x; c.v -= x;
    if (d.v <= 0) deb.shift();
    if (c.v <= 0) cre.shift();
  }
  return out;
}

const memberOf = (t, id) => t.members?.[id] || { name: t.ghosts?.[id] || 'Ancien membre', color: 2 };

function viewMoney(t) {
  const me = state.me.id;
  const { bal, paid, owed, total } = computeBalances(t);
  const tx = settlements(bal);
  const exps = Object.values(t.expenses || {}).sort((a, b) => (b.at || 0) - (a.at || 0));
  const myBal = bal[me] || 0;
  const maxAbs = Math.max(1, ...Object.values(bal).map(Math.abs));

  if (!exps.length) return `<div class="glass empty"><div class="big">💶</div><h3>Aucune dépense</h3><p>Ajoute les courses, le logement, l’essence…<br>Tripizi calcule qui doit combien à qui.</p><div class="spacer"></div><button class="btn btn-primary" data-act="add-exp">${I.plus.replace('<svg', '<svg width="18" height="18"')}Ajouter une dépense</button></div>`;

  return `
  <div class="stats">
    <div class="glass stat"><span class="eyebrow">Total</span><b>${euro(total)}</b></div>
    <div class="glass stat"><span class="eyebrow">Ma part</span><b>${euro(owed[me] || 0)}</b></div>
    <div class="glass stat ${myBal > 0 ? 'pos' : myBal < 0 ? 'neg' : ''}"><span class="eyebrow">Mon solde</span><b>${myBal > 0 ? '+' : ''}${euro(myBal)}</b></div>
  </div>

  <div class="section-h"><span class="eyebrow">Remboursements</span>${tx.length ? `<span class="chip">${tx.length}</span>` : ''}</div>
  <div class="glass" style="padding:4px 0;margin-bottom:18px">
    ${tx.length ? tx.map((r) => {
      const f = memberOf(t, r.from), to = memberOf(t, r.to), mine = r.from === me || r.to === me;
      return `<div class="tx ${mine ? 'mine' : ''}">
        ${avatar(f, 'sm')}<span class="who">${esc(f.name)}</span>
        <span class="ar">${I.arrow}</span>
        ${avatar(to, 'sm')}<span class="who">${esc(to.name)}</span>
        <b class="amt">${euro(r.amount)}</b>
        ${mine ? `<button class="btn btn-ghost btn-sm" data-act="settle" data-from="${r.from}" data-to="${r.to}" data-amt="${r.amount}">Réglé ✓</button>` : ''}
      </div>`;
    }).join('') : `<div class="tx"><span class="who" style="text-align:center;flex:1">Tout le monde est quitte 🎉</span></div>`}
  </div>

  <div class="section-h"><span class="eyebrow">Soldes</span></div>
  <div class="glass" style="padding:6px 14px;margin-bottom:18px">
    ${Object.keys(bal).sort((a, b) => bal[b] - bal[a]).map((id) => {
      const m = memberOf(t, id), v = bal[id], w = Math.abs(v) / maxAbs * 50;
      return `<div class="balrow">${avatar(m, 'sm')}<span class="nm">${esc(m.name)}${id === me ? ' <span class="you">TOI</span>' : ''}<small>payé ${euro(paid[id])}</small></span>
        <span class="track"><i class="${v >= 0 ? 'p' : 'n'}" style="width:${w}%"></i></span>
        <b class="${v > 0 ? 'pos' : v < 0 ? 'neg' : ''}">${v > 0 ? '+' : ''}${euro(v)}</b></div>`;
    }).join('')}
  </div>

  <div class="section-h"><span class="eyebrow">Historique</span><span class="chip">${exps.length}</span></div>
  <div class="glass" style="padding:4px 0">
    ${exps.map((e) => {
      const by = memberOf(t, e.by);
      if (e.type === 'transfer') {
        const to = memberOf(t, e.for?.[0]);
        return `<div class="exp transfer"><span class="cat">🤝</span><div class="info"><b>${esc(by.name)} a remboursé ${esc(to.name)}</b><small>${fmtDate(e.at)}</small></div><b class="amt">${euro(e.amount)}</b>${e.createdBy === me ? `<button class="del" data-act="del-exp" data-id="${e.id}" aria-label="Supprimer">${I.trash}</button>` : ''}</div>`;
      }
      const n = (e.for || []).length;
      return `<div class="exp"><span class="cat">${e.cat || '💸'}</span><div class="info"><b>${esc(e.title)}</b><small>Payé par ${esc(by.name)} · ${n === Object.keys(t.members || {}).length ? 'pour tous' : `pour ${n}`} · ${fmtDate(e.at)}</small></div><b class="amt">${euro(e.amount)}</b>${e.createdBy === me || e.by === me ? `<button class="del" data-act="del-exp" data-id="${e.id}" aria-label="Supprimer">${I.trash}</button>` : ''}</div>`;
    }).join('')}
  </div>`;
}
const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';

function sheetExpense() {
  const t = state.trip;
  const ids = Object.keys(t.members || {});
  let payer = state.me.id, forIds = new Set(ids), cat = EXP_CATS[0][0];
  const chip = (id, on, kind) => `<button class="pick ${on ? 'on' : ''}" data-${kind}="${id}">${avatar(t.members[id], 'sm')}${esc(t.members[id].name)}</button>`;
  openSheet(`
    <h2>Nouvelle dépense</h2><p class="lead">Partagée à parts égales entre les personnes cochées.</p>
    <div class="stack">
      <div class="grid-2" style="grid-template-columns:1.4fr 1fr">
        <div class="field"><label>Quoi ?</label><input class="input" id="e-title" maxlength="40" placeholder="Courses Carrefour"></div>
        <div class="field"><label>Montant (€)</label><input class="input" id="e-amt" inputmode="decimal" placeholder="45,80"></div>
      </div>
      <div class="field"><label>Catégorie</label><div class="emoji-row">${EXP_CATS.map(([e, l]) => `<button data-cat="${e}" class="${e === cat ? 'on' : ''}" title="${l}">${e}</button>`).join('')}</div></div>
      <div class="field"><label>Payé par</label><div class="picks" id="e-payer">${ids.map((id) => chip(id, id === payer, 'payer')).join('')}</div></div>
      <div class="field"><label>Pour qui ? <span id="e-each" class="muted"></span></label><div class="picks" id="e-for">${ids.map((id) => chip(id, true, 'for')).join('')}</div></div>
      <button class="btn btn-primary btn-block" id="e-go">Ajouter la dépense</button>
    </div>`, (root) => {
    const each = () => {
      const c = toCents($('#e-amt').value);
      $('#e-each').textContent = c > 0 && forIds.size ? `· ${euro(Math.ceil(c / forIds.size))} / pers.` : '';
    };
    $('#e-amt', root).addEventListener('input', each);
    root.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => { cat = b.dataset.cat; root.querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b)); });
    root.querySelectorAll('[data-payer]').forEach((b) => b.onclick = () => { payer = b.dataset.payer; root.querySelectorAll('[data-payer]').forEach((x) => x.classList.toggle('on', x === b)); });
    root.querySelectorAll('[data-for]').forEach((b) => b.onclick = () => {
      const id = b.dataset.for;
      if (forIds.has(id)) forIds.delete(id); else forIds.add(id);
      b.classList.toggle('on', forIds.has(id)); each();
    });
    $('#e-go', root).onclick = async () => {
      const amount = toCents($('#e-amt').value);
      const title = $('#e-title').value.trim() || EXP_CATS.find(([e]) => e === cat)[1];
      if (!(amount > 0)) return toast('Indique un montant');
      if (amount > 10000000) return toast('Montant trop élevé');
      if (!forIds.size) return toast('Coche au moins une personne');
      const id = uid();
      await store.update(state.code, { [`expenses.${id}`]: { id, title, amount, cat, by: payer, for: [...forIds], at: Date.now(), createdBy: state.me.id }, ...feed(`ex_${id}`, 'expense', `a ajouté une dépense : ${title} (${euro(amount)})`) });
      closeSheet(); toast(`Dépense ajoutée : ${euro(amount)} 💶`);
    };
  });
}

/* ═════════════════ Feuilles (bottom sheets) ═════════════════ */
function openSheet(html, onMount) {
  const root = $('#sheet-root');
  root.innerHTML = `<div class="sheet-backdrop" data-act="close-sheet"></div><div class="sheet"><div class="grab"></div>${html}</div>`;
  onMount?.(root);
  setTimeout(() => root.querySelector('input')?.focus(), 350);
}
const closeSheet = () => { $('#sheet-root').innerHTML = ''; if (state.me && (state.screen === 'trip' || state.myTrips.length)) renderKeepScroll(); };

function sheetTrip(existing) {
  const today = new Date();
  const t = existing || { name: '', destination: '', emoji: '🏖️', cover: Math.floor(Math.random() * COVERS.length), start: toKey(addDays(today, 14)), end: toKey(addDays(today, 44)) };
  let emoji = t.emoji;
  openSheet(`
    <h2>${existing ? 'Modifier l’escapade' : 'Nouvelle escapade'}</h2>
    <p class="lead">${existing ? 'Ajuste les infos du voyage.' : 'Donne-lui un nom, une période possible, et invite ta bande.'}</p>
    <div class="stack">
      <div class="field"><label>Nom</label><input class="input" id="f-name" maxlength="40" placeholder="Week-end à Biarritz" value="${esc(t.name)}"></div>
      <div class="field"><label>Destination</label><input class="input" id="f-dest" maxlength="50" placeholder="Pays basque" value="${esc(t.destination)}"></div>
      <div class="field"><label>Ambiance</label><div class="emoji-row">${EMOJIS.map((e) => `<button data-e="${e}" class="${e === emoji ? 'on' : ''}">${e}</button>`).join('')}</div></div>
      <div class="field"><label>Période envisagée (chacun choisira ses jours dedans)</label>
        <div class="grid-2"><input class="input" type="date" id="f-start" value="${t.start}"><input class="input" type="date" id="f-end" value="${t.end}"></div></div>
      <button class="btn btn-primary btn-block" id="f-go">${existing ? 'Enregistrer' : 'Créer l’escapade 🚀'}</button>
    </div>`, (root) => {
    root.querySelectorAll('.emoji-row button').forEach((b) => b.onclick = () => {
      emoji = b.dataset.e; root.querySelectorAll('.emoji-row button').forEach((x) => x.classList.toggle('on', x === b));
    });
    $('#f-go', root).onclick = async () => {
      const name = $('#f-name').value.trim(), destination = $('#f-dest').value.trim();
      let start = $('#f-start').value, end = $('#f-end').value;
      if (!name) return toast('Donne un nom à ton escapade');
      if (!start || !end) return toast('Choisis une période');
      if (end < start) [start, end] = [end, start];
      if (daysBetween(start, end) > 180) return toast('Période max : 6 mois');
      try {
        if (existing) {
          await store.update(existing.code, { name, destination, emoji, start, end, ...feed('trip', 'trip', `a modifié l’escapade (${fmt(start)} → ${fmt(end)})`) });
          toast('Escapade mise à jour ✨');
        } else {
          const code = makeCode();
          const trip = { code, name, destination, emoji, cover: t.cover, start, end, owner: state.me.id, createdAt: Date.now(),
            members: { [state.me.id]: { name: state.me.name, color: state.me.color } }, avail: {}, links: {}, expenses: {} };
          await store.create(trip);
          state.myTrips.unshift(code); saveMyTrips(); state.cache[code] = trip;
          openTrip(code); toast('Escapade créée ! Partage le code 🎉');
        }
        closeSheet();
      } catch (e) { console.error(e); toast('Erreur : ' + e.message); }
    };
  });
}

/* Rejoindre une escapade par son code (formulaire ou lien d'invitation) */
async function joinByCode(code) {
  code = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) { toast('Le code fait 6 caractères'); return false; }
  if (state.myTrips.includes(code)) { closeSheet(); openTrip(code); return true; }
  try {
    const t = await store.get(code);
    if (!t) { toast(store.mode === 'local' ? 'Code introuvable sur ce téléphone (mode local)' : 'Code introuvable'); return false; }
    await store.update(code, { [`members.${state.me.id}`]: { name: state.me.name, color: state.me.color }, ...feed(`jn_${state.me.id}`, 'join', 'a rejoint l’escapade 🙌') });
    state.myTrips.unshift(code); saveMyTrips();
    closeSheet(); openTrip(code); toast(`Bienvenue dans « ${t.name} » 🙌`);
    return true;
  } catch (e) { console.error(e); toast('Erreur : ' + e.message); return false; }
}

/* Lien d'invitation : https://…/join.html?c=CODE (page web) ou mescons://join?c=CODE (ouvre l'app) */
const INVITE_PAGE = 'https://fred09021985.github.io/bandaway/join.html';
function inviteUrl(t) {
  const q = new URLSearchParams({ c: t.code, t: t.name.slice(0, 40), i: state.me.name.slice(0, 20) });
  return `${INVITE_PAGE}?${q.toString()}`;
}
function codeFromUrl(url) {
  try { const c = new URL(url).searchParams.get('c'); return c && /^[A-Za-z0-9]{6}$/.test(c) ? c.toUpperCase() : null; } catch { return null; }
}
async function handleInvite(url) {
  const code = codeFromUrl(url);
  if (!code) return;
  if (!state.me || !store) { local.set('bw:pending', code); return; }
  await joinByCode(code);
}

function sheetJoin() {
  openSheet(`
    <h2>Rejoindre la bande</h2>
    <p class="lead">Entre le code à 6 caractères reçu de ton pote.</p>
    <div class="stack">
      <input class="input code-input" id="j-code" maxlength="6" placeholder="••••••" autocomplete="off" autocapitalize="characters">
      <button class="btn btn-primary btn-block" id="j-go">Rejoindre</button>
    </div>`, (root) => {
    $('#j-go', root).onclick = () => joinByCode($('#j-code').value.trim().replace(/.*[?&]c=([A-Za-z0-9]{6}).*/, '$1'));
  });
}

function sheetLink(existing) {
  const e = existing || {};
  let type = e.priceType || 'night';
  openSheet(`
    <h2>${existing ? 'Modifier le logement' : 'Proposer un logement'}</h2>
    <p class="lead">${existing ? 'Change le lien, le prix ou la note. Les votes sont conservés.' : 'Colle le lien de l’annonce (Airbnb, Booking, Abritel…).'}</p>
    <div class="stack">
      <div class="field"><label>Lien</label><input class="input" id="l-url" inputmode="url" placeholder="https://www.airbnb.fr/rooms/…" value="${esc(e.url || '')}"></div>
      <div class="field"><label>Titre (optionnel)</label><input class="input" id="l-title" maxlength="70" placeholder="Villa vue mer avec piscine" value="${esc(e.title || '')}"></div>
      <div class="field"><label>Prix (optionnel)</label>
        <div class="grid-2"><input class="input" id="l-price" type="number" inputmode="decimal" min="0" placeholder="120 €" value="${e.price || ''}">
        <div class="mode-switch" style="height:52px;border-radius:16px"><button class="${type === 'night' ? 'on' : ''}" data-t="night" style="height:42px">/ nuit</button><button class="${type === 'total' ? 'on' : ''}" data-t="total" style="height:42px">Total</button></div></div></div>
      <div class="field"><label>Note pour la bande</label><textarea class="input" id="l-note" maxlength="200" placeholder="4 chambres, jacuzzi, 10 min de la plage 🔥">${esc(e.note || '')}</textarea></div>
      <button class="btn btn-primary btn-block" id="l-go">${existing ? 'Enregistrer' : 'Ajouter'}</button>
    </div>`, (root) => {
    root.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { type = b.dataset.t; root.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x === b)); });
    $('#l-url', root).addEventListener('blur', () => { const u = $('#l-url').value.trim(); if (u && !$('#l-title').value) $('#l-title').placeholder = guessTitle(normUrl(u)); });
    $('#l-go', root).onclick = async () => {
      const url = normUrl($('#l-url').value.trim());
      try { new URL(url); } catch { return toast('Lien invalide'); }
      const fields = { url, title: $('#l-title').value.trim() || guessTitle(url), price: Number($('#l-price').value) || 0, priceType: type, note: $('#l-note').value.trim() };
      if (existing) {
        const patch = { [`links.${e.id}.editedAt`]: Date.now(), [`links.${e.id}.editedBy`]: state.me.id };
        for (const [k, v] of Object.entries(fields)) patch[`links.${e.id}.${k}`] = v;
        Object.assign(patch, feed(`lk_${e.id}`, 'link', `a modifié le logement « ${fields.title} »`));
        await store.update(state.code, patch);
        closeSheet(); toast('Logement modifié ✏️');
      } else {
        const id = uid();
        await store.update(state.code, { [`links.${id}`]: { id, ...fields, by: state.me.id, at: Date.now(), votes: { [state.me.id]: 1 } }, ...feed(`lk_${id}`, 'link', `a proposé un logement : ${fields.title}${fields.price ? ` (${fields.price} € ${fields.priceType === 'night' ? '/ nuit' : 'total'})` : ''}`) });
        closeSheet(); toast('Logement ajouté 🏡');
      }
    };
  });
}
const normUrl = (u) => {
  const m = u.match(/https?:\/\/\S+/); if (m) return m[0];
  return u && !/^https?:/.test(u) ? 'https://' + u : u;
};

function sheetMe() {
  let color = state.me.color;
  openSheet(`
    <h2>Mon profil</h2><p class="lead">Ton nom et ta couleur visibles par la bande.</p>
    <div class="stack">
      <div class="field"><label>Pseudo</label><input class="input" id="m-name" maxlength="20" value="${esc(state.me.name)}"></div>
      <div class="colors">${AVATAR_COLORS.map((c, i) => `<button class="color-pick ${i === color ? 'on' : ''}" data-i="${i}" style="background:linear-gradient(135deg,${c[0]},${c[1]})"></button>`).join('')}</div>
      <button class="btn btn-primary btn-block" id="m-go">Enregistrer</button>
      <button class="btn btn-ghost btn-block" data-act="feedback">💬 Donner mon avis sur l’app</button>
      <p class="muted" style="font-size:12px;text-align:center">Synchronisation : ${store.mode === 'cloud' ? '☁️ cloud (temps réel)' : '📱 locale (démo)'} · version ${APP_VERSION || 'dev'}</p>
    </div>`, (root) => {
    root.querySelectorAll('.color-pick').forEach((b) => b.onclick = () => { color = +b.dataset.i; root.querySelectorAll('.color-pick').forEach((x) => x.classList.toggle('on', x === b)); });
    $('#m-go', root).onclick = async () => {
      const name = $('#m-name').value.trim(); if (!name) return;
      state.me = { ...state.me, name, color }; local.set('bw:me', state.me);
      for (const c of state.myTrips) { try { await store.update(c, { [`members.${state.me.id}`]: { name, color } }); } catch {} }
      closeSheet(); render(); toast('Profil mis à jour');
    };
  });
}


/* ═════════════════ Avis des utilisateurs ═════════════════ */
const FB_TYPES = [['idea', '💡', 'Idée'], ['bug', '🐞', 'Bug'], ['love', '❤️', 'J’aime']];
function sheetFeedback() {
  let type = 'idea';
  openSheet(`
    <h2>Donner mon avis</h2>
    <p class="lead">Une idée, un bug, un truc que tu adores ? Ton message arrive directement chez le créateur de l’app.</p>
    <div class="stack">
      <div class="fb-types">${FB_TYPES.map(([k, e, l]) => `<button class="fb-type ${k === type ? 'on' : ''}" data-fbt="${k}"><span>${e}</span>${l}</button>`).join('')}</div>
      <div class="field"><label id="fb-label">Ton idée</label><textarea class="input" id="fb-msg" maxlength="1000" style="height:140px" placeholder="Ex : pouvoir ajouter des photos aux logements…"></textarea>
        <div class="muted" style="font-size:11.5px;text-align:right;margin-top:4px"><span id="fb-count">0</span>/1000</div></div>
      <button class="btn btn-primary btn-block" id="fb-go">Envoyer</button>
    </div>`, (root) => {
    const ph = { idea: ['Ton idée', 'Ex : pouvoir ajouter des photos aux logements…'], bug: ['Ce qui ne marche pas', 'Ex : quand je touche « Réglé », rien ne se passe…'], love: ['Ce que tu aimes', 'Ex : le calcul des remboursements, trop pratique !'] };
    root.querySelectorAll('[data-fbt]').forEach((b) => b.onclick = () => {
      type = b.dataset.fbt; root.querySelectorAll('[data-fbt]').forEach((x) => x.classList.toggle('on', x === b));
      $('#fb-label').textContent = ph[type][0]; $('#fb-msg').placeholder = ph[type][1];
    });
    $('#fb-msg', root).addEventListener('input', (e) => { $('#fb-count').textContent = e.target.value.length; });
    $('#fb-go', root).onclick = async () => {
      const message = $('#fb-msg').value.trim();
      if (message.length < 3) return toast('Écris quelques mots 🙂');
      const last = local.get('bw:lastfb', 0);
      if (Date.now() - last < 30000) return toast('Patiente quelques secondes avant un nouvel avis');
      const btn = $('#fb-go'); btn.disabled = true; btn.textContent = 'Envoi…';
      try {
        await store.sendFeedback({ type, message: message.slice(0, 1000), name: String(state.me?.name || '').slice(0, 20), uid: String(state.me?.id || '').slice(0, 40), version: Number(APP_VERSION) || 0 });
        local.set('bw:lastfb', Date.now());
        closeSheet(); toast('Merci pour ton avis ! 🙏');
      } catch (e) {
        console.error(e); btn.disabled = false; btn.textContent = 'Envoyer';
        toast('Envoi impossible, vérifie ta connexion');
      }
    };
  });
}

/* ═════════════════ Navigation & sync ═════════════════ */
function watchAll() {
  for (const code of state.myTrips) {
    if (watchAll.subs?.[code]) continue;
    watchAll.subs = watchAll.subs || {};
    watchAll.subs[code] = store.subscribe(code, (t) => {
      if (t) { state.cache[code] = t; local.set(`bw:cache:${code}`, t); }
      if (state.code === code) state.trip = t;
      if (!$('#sheet-root').innerHTML) renderKeepScroll();
    });
  }
}
function renderKeepScroll() { const y = window.scrollY; render(); window.scrollTo(0, y); }

function openTrip(code) {
  state.code = code; state.trip = state.cache[code] || null; state.screen = 'trip'; state.tab = 'dates'; state.calMode = 'mine';
  watchAll(); render(); window.scrollTo(0, 0);
}
function goHome() { state.screen = 'home'; state.code = null; state.trip = null; render(); window.scrollTo(0, 0); }

async function shareTrip() {
  const t = state.trip;
  const url = inviteUrl(t);
  const text = `🌍 ${state.me.name} t'invite à rejoindre « ${t.name} » sur Tripizi !\n👉 ${url}\n(code : ${t.code})`;
  const Share = window.Capacitor?.Plugins?.Share;
  try {
    if (Share) return await Share.share({ title: 'Tripizi', text, dialogTitle: 'Inviter la bande' });
    if (navigator.share) return await navigator.share({ title: 'Tripizi', text });
  } catch { return; }
  try { await navigator.clipboard.writeText(text); toast('Invitation copiée 📋'); } catch { toast(`Code : ${t.code}`); }
}

/* ═════════════════ Événements ═════════════════ */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  const t = state.trip;
  switch (a) {
    case 'pick-color': state._color = +el.dataset.i; const v = $('#ob-name')?.value; render(); if (v) $('#ob-name').value = v; break;
    case 'onboard': {
      const name = $('#ob-name').value.trim(); if (!name) return toast('Choisis un pseudo');
      state.me = { id: uid(), name, color: state._color ?? 0 }; local.set('bw:me', state.me); render();
      const pending = local.get('bw:pending'); if (pending) { local.del('bw:pending'); joinByCode(pending); }
      setTimeout(setupPush, 1500);
      break;
    }
    case 'new': sheetTrip(); break;
    case 'join': sheetJoin(); break;
    case 'edit-me': sheetMe(); break;
    case 'feedback': closeSheet(); setTimeout(sheetFeedback, 50); break;
    case 'edit-trip': sheetTrip(t); break;
    case 'close-sheet': closeSheet(); break;
    case 'open': openTrip(el.dataset.code); break;
    case 'home': goHome(); break;
    case 'tab': state.tab = el.dataset.tab; render(); break;
    case 'cal-mode': state.calMode = el.dataset.m; renderKeepScroll(); break;
    case 'share': shareTrip(); break;
    case 'add-link': sheetLink(); break;
    case 'edit-link': { const l = t.links?.[el.dataset.id]; if (l) sheetLink(l); break; }
    case 'add-exp': sheetExpense(); break;
    case 'settle': {
      const from = el.dataset.from, to = el.dataset.to, amount = +el.dataset.amt;
      if (!confirm(`${memberOf(t, from).name} a remboursé ${euro(amount)} à ${memberOf(t, to).name} ?`)) return;
      const id = uid();
      await store.update(state.code, { [`expenses.${id}`]: { id, type: 'transfer', title: 'Remboursement', amount, by: from, for: [to], at: Date.now(), createdBy: state.me.id }, ...feed(`ex_${id}`, 'settle', `a enregistré un remboursement : ${memberOf(t, from).name} → ${memberOf(t, to).name} (${euro(amount)})`) });
      toast('Remboursement enregistré 🤝'); break;
    }
    case 'del-exp': if (confirm('Supprimer cette dépense ?')) await store.update(state.code, { [`expenses.${el.dataset.id}`]: null }); break;
    case 'day': {
      const k = el.dataset.k, cur = t.avail?.[state.me.id]?.[k] || '';
      const next = { '': 'yes', yes: 'maybe', maybe: 'no', no: null }[cur];
      // Mise à jour optimiste pour une UI instantanée
      t.avail = t.avail || {}; t.avail[state.me.id] = t.avail[state.me.id] || {};
      if (next) t.avail[state.me.id][k] = next; else delete t.avail[state.me.id][k];
      renderKeepScroll();
      store.update(state.code, { [`avail.${state.me.id}.${k}`]: next, ...feed(`av_${state.me.id}`, 'avail', 'a mis à jour ses dispos 📅') }).catch(() => toast('Erreur de synchro'));
      navigator.vibrate?.(8);
      break;
    }
    case 'day-info': {
      const k = el.dataset.k;
      const groups = { yes: [], maybe: [], no: [], '': [] };
      for (const [id, m] of Object.entries(t.members)) groups[t.avail?.[id]?.[k] || ''].push(m.name);
      toast(`${fmt(k, { weekday: 'short', day: 'numeric' })} · ✅ ${groups.yes.join(', ') || '—'}${groups.maybe.length ? ` · 🤔 ${groups.maybe.join(', ')}` : ''}`);
      break;
    }
    case 'all-days': state.allDays = !state.allDays; renderKeepScroll(); break;
    case 'quick': {
      const q = el.dataset.q, patch = {};
      for (const k of periodDays(t)) {
        const dow = fromKey(k).getDay();
        if (q === 'all') patch[`avail.${state.me.id}.${k}`] = 'yes';
        else if (q === 'we' && (dow === 0 || dow === 6)) patch[`avail.${state.me.id}.${k}`] = 'yes';
      }
      if (q === 'clear') await store.update(state.code, { [`avail.${state.me.id}`]: {} });
      else await store.update(state.code, { ...patch, ...feed(`av_${state.me.id}`, 'avail', 'a mis à jour ses dispos 📅') });
      toast(q === 'clear' ? 'Dispos effacées' : 'Dispos ajoutées ✓');
      break;
    }
    case 'vote': {
      const id = el.dataset.id, has = t.links?.[id]?.votes?.[state.me.id];
      el.classList.add('pop');
      await store.update(state.code, { [`links.${id}.votes.${state.me.id}`]: has ? null : 1 });
      break;
    }
    case 'del-link': if (confirm('Supprimer ce logement ?')) await store.update(state.code, { [`links.${el.dataset.id}`]: null }); break;
    case 'leave': {
      const myBal = computeBalances(t).bal[state.me.id] || 0;
      if (Math.abs(myBal) > 0) return toast(`Règle d'abord ton solde (${euro(myBal)}) avant de partir`);
      if (!confirm('Quitter cette escapade ?')) return;
      await store.update(state.code, { [`members.${state.me.id}`]: null, [`avail.${state.me.id}`]: null, [`ghosts.${state.me.id}`]: state.me.name }).catch(() => {});
      state.myTrips = state.myTrips.filter((c) => c !== state.code); saveMyTrips();
      watchAll.subs?.[state.code]?.(); delete watchAll.subs?.[state.code]; delete state.cache[state.code];
      goHome(); toast('Tu as quitté l’escapade'); break;
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('#ob-name')) $('[data-act=onboard]')?.click();
  if (e.key === 'Enter' && e.target.matches('#j-code')) $('#j-go')?.click();
});


/* ═════════════════ Mises à jour à distance (Capgo, auto-hébergé) ═════════════════
   À chaque compilation, GitHub publie update.zip (le contenu de www/) dans la release.
   Au démarrage, l'app compare son numéro de build à la dernière release ; si elle est
   plus récente, elle télécharge le paquet et l'applique (tout de suite ou au prochain lancement).
   Seul le code web (écrans, styles, logique) est mis à jour ainsi : nom, icône ou
   modules natifs nécessitent toujours un nouvel APK. */
const UPDATE_API = 'https://api.github.com/repos/Fred09021985/bandaway/releases/latest';
const Updater = () => window.Capacitor?.Plugins?.CapacitorUpdater;

function updateBar(html) {
  let el = $('#update-bar');
  if (!el) { el = document.createElement('div'); el.id = 'update-bar'; document.body.appendChild(el); }
  el.innerHTML = html; el.classList.add('show');
  return el;
}

async function checkLiveUpdate() {
  const U = Updater();
  if (!U || !navigator.onLine) return;
  let rel, latest = 0;
  try {
    const r = await fetch(UPDATE_API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (!r.ok) return;
    rel = await r.json();
    latest = parseInt(String(rel.tag_name || '').replace(/\D/g, ''), 10) || 0;
  } catch { return; }
  const asset = (rel.assets || []).find((a) => a.name === 'update.zip');
  if (!asset || latest <= APP_VERSION) return;
  // Empreinte SHA-256 exigée par le module : fournie par GitHub (digest), sinon notée dans la release
  const checksum = (String(asset.digest || '').match(/^sha256:([a-f0-9]{64})$/i) || String(rel.body || '').match(/checksum:\s*([a-f0-9]{64})/i) || [])[1];
  if (!checksum) return;
  const version = `1.0.${latest}`;
  try {
    let bundle = (await U.list().catch(() => ({ bundles: [] }))).bundles?.find((b) => b.version === version && b.status !== 'error');
    if (!bundle) {
      updateBar('<span class="spin"></span>Téléchargement de la mise à jour…');
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Délai dépassé')), 90000));
      bundle = await Promise.race([U.download({ url: asset.browser_download_url, version, checksum: checksum.toLowerCase() }), timeout]);
    }
    await U.next({ id: bundle.id });
    updateBar(`<span>✨ Nouvelle version prête (${latest})</span><button id="upd-now">Redémarrer</button><button id="upd-later" aria-label="Plus tard">✕</button>`);
    $('#upd-now').onclick = () => { updateBar('<span class="spin"></span>Installation…'); U.set({ id: bundle.id }); };
    $('#upd-later').onclick = () => { $('#update-bar').classList.remove('show'); toast('Elle s’installera au prochain lancement'); };
  } catch (e) {
    console.warn('Mise à jour impossible', e);
    const apk = (rel.assets || []).find((a) => /\.apk$/i.test(a.name));
    updateBar(`<span>⚠️ Mise à jour impossible</span>${apk ? `<a id="upd-apk" href="${esc(apk.browser_download_url)}" target="_blank" rel="noopener">Installer l’APK</a>` : ''}<button id="upd-later" aria-label="Fermer">✕</button>`);
    $('#upd-later').onclick = () => $('#update-bar').classList.remove('show');
  }
}

/* Version web sur iPhone : explique comment l'ajouter à l'écran d'accueil (une fois par semaine max) */
function iosInstallHint() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (!ios || standalone || Date.now() - (local.get('bw:a2hs') || 0) < 7 * 864e5) return;
  const bar = updateBar(`<span>📲 Installe l’app : <b>Partager</b> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8"/></svg> puis <b>Sur l’écran d’accueil</b></span><button id="upd-later" aria-label="Fermer">✕</button>`);
  bar.classList.add('wrap');
  $('#upd-later').onclick = () => { local.set('bw:a2hs', Date.now()); bar.classList.remove('show'); };
}

/* ═════════════════ Notifications push (Android) ═════════════════
   Le téléphone s'enregistre (jeton FCM + escapades suivies) dans Firestore « devices ».
   Toutes les 10 min, GitHub Actions lit le journal « feed » des escapades et envoie les notifs. */
const Push = () => window.Capacitor?.isNativePlatform?.() ? window.Capacitor.Plugins?.PushNotifications : null;
let pushToken = local.get('bw:pushtoken');
async function syncDevice() {
  if (!pushToken || !state.me || !store?.saveDevice) return;
  try { await store.saveDevice({ token: pushToken, uid: state.me.id, trips: state.myTrips.slice(0, 50), platform: 'android' }); } catch (e) { console.warn('device', e); }
}
async function setupPush() {
  const P = Push();
  if (!P || store.mode !== 'cloud') return;
  try {
    P.addListener('registration', (t) => { pushToken = t.value; local.set('bw:pushtoken', pushToken); syncDevice(); });
    P.addListener('registrationError', (e) => console.warn('push', e));
    P.addListener('pushNotificationActionPerformed', (a) => {
      const code = a?.notification?.data?.code;
      if (code && state.myTrips.includes(code)) { closeSheet?.(); openTrip(code); }
    });
    await P.createChannel?.({ id: 'tripizi', name: 'Nouveautés des escapades', description: 'Quand un pote ajoute des dispos, un logement ou une dépense', importance: 4, vibration: true }).catch(() => {});
    let perm = await P.checkPermissions();
    if (perm.receive === 'prompt' || perm.receive === 'prompt-with-rationale') perm = await P.requestPermissions();
    if (perm.receive === 'granted') await P.register();
  } catch (e) { console.warn('push', e); }
}

/* ═════════════════ Démarrage ═════════════════ */
(async function boot() {
  // Confirme au module de mise à jour que cette version démarre bien (sinon retour automatique à la précédente)
  Updater()?.notifyAppReady?.().catch(() => {});
  if (state.me) setTimeout(setupPush, 3000);
  for (const c of state.myTrips) { const cached = local.get(`bw:cache:${c}`); if (cached) state.cache[c] = cached; }
  store = await createStore();
  render();
  watchAll();
  setTimeout(checkLiveUpdate, 1500);
  const App = window.Capacitor?.Plugins?.App;
  // Ouverture via un lien d'invitation (mescons://join?c=CODE)
  App?.addListener?.('appUrlOpen', (ev) => handleInvite(ev.url));
  try { const l = await App?.getLaunchUrl?.(); if (l?.url) await handleInvite(l.url); } catch {}
  const pending = state.me && local.get('bw:pending'); if (pending) { local.del('bw:pending'); joinByCode(pending); }
  // Version web (iPhone) : invitation reçue dans l'adresse (?c=CODE), puis bandeau d'installation
  if (!window.Capacitor?.isNativePlatform?.()) {
    if (codeFromUrl(location.href)) { await handleInvite(location.href); history.replaceState(null, '', location.pathname); }
    setTimeout(iosInstallHint, 2500);
  }
  // Bouton retour Android
  App?.addListener?.('backButton', () => {
    if ($('#sheet-root').innerHTML) closeSheet();
    else if (state.screen === 'trip') goHome();
    else App.exitApp();
  });
})();
