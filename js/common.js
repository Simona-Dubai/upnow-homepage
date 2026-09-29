/* Shared UI: icons, header, cards, filter engine, URL state, lead capture (call / WhatsApp / request). */
(function () {
  const { VERTICALS, VORDER, LISTINGS, AREAS, areaById, areaName, offerOf } = UP;

  /* ---------- icons ---------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    car: '<path d="M5 17h14M5 17v2M19 17v2M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v4H3z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    grad: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5M22 9v6"/>',
    grid4: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    bed: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
    bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>',
    area: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 4.8a3.2 3.2 0 0 1 0 6.2M18 14.8c1.8.6 3 2.4 3 5.2"/>',
    ruler: '<path d="m3 17 14-14 4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.3-4.4"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.1A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
    phone: '<path d="M5 3h3.5l1.8 4.6-2.3 1.5a11 11 0 0 0 6 6l1.5-2.3L20 14.5V18a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    wa: '<path d="M4 20l1.2-3.8A8.5 8.5 0 1 1 8 19z"/><path d="M9 9.2c.2 2.6 3 5.2 5.6 5.6l1.1-1.3-1.8-.9-.8.8c-1-.4-2.2-1.6-2.6-2.6l.8-.8-.9-1.8z"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>',
    chevL: '<path d="m15 6-6 6 6 6"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    building: '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    cross: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
    umbrella: '<path d="M3 12a9 9 0 0 1 18 0zM12 12v7a2 2 0 0 0 4 0"/>',
    badge: '<path d="M12 2.5 14.6 5l3.6-.2.4 3.6L21 11l-2 3 .6 3.6-3.6.8-2 3-2.9-1.7L8.2 21l-1.8-3.2-3.5-1 .5-3.6L1.5 10 4.4 7.9 4.5 4.3 8 4.6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>'
  };
  const ico = (n, cls = '') => `<svg class="ico ${cls}" viewBox="0 0 24 24">${P[n] || P.spark}</svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- normalise defs (date → select etc.) ---------- */
  const DATE_OPTS = [{ v: '0', l: 'Today' }, { v: '1', l: 'Tomorrow' }, { v: '3', l: 'Next 3 days' }, { v: '7', l: 'This week' }, { v: '14', l: 'Next 2 weeks' }];
  VORDER.forEach(v => VERTICALS[v].offers.forEach(off => {
    off.defs.forEach(d => {
      if (d.type === 'date') { d.type = 'select'; d.options = DATE_OPTS; d.isDate = 1; if (!d.noMatch) d.test = (lv, val) => lv <= +val; d.fmtFact = x => x === 0 ? 'Available today' : x === 1 ? 'From tomorrow' : 'In ' + x + ' days'; }
    });
    off.def = id => off.defs.find(d => d.id === id);
    off.optional = off.defs.filter(d => !off.fields.includes(d.id));
  }));
  VERTICALS.all = { id: 'all', label: 'All', icon: 'grid4', blurb: 'Everything on UpNow', offers: [] };
  const TABS = ['all', ...VORDER];

  /* ---------- favourites + leads ---------- */
  const store = { get: k => { try { return JSON.parse(localStorage.getItem('upnow.' + k)) } catch (e) { return null } }, set: (k, v) => localStorage.setItem('upnow.' + k, JSON.stringify(v)) };
  const favs = new Set(store.get('favs') || []);
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id); store.set('favs', [...favs]);
    document.querySelectorAll(`[data-fav="${id}"]`).forEach(b => b.classList.toggle('on', favs.has(id)));
    toast(favs.has(id) ? 'Saved to your shortlist' : 'Removed from shortlist'); updateHdrCounts();
  }
  function logLead(type, l) { const a = store.get('leads') || []; a.push({ type, id: l.id, t: Date.now() }); store.set('leads', a); updateHdrCounts(); }

  /* ---------- header / footer ---------- */
  function header(active) {
    const nav = VORDER.map(v => [v, VERTICALS[v].label]);
    return `<header class="hdr"><div class="wrap">
      <a class="logo" href="Home.html"><b>U</b>UpNow</a>
      <nav class="nav">${nav.map(([v, l]) => `<a href="Search.html?v=${v}" data-nav="${v}" class="${active === v ? 'on' : ''}">${l}</a>`).join('')}</nav><div class="sp"></div>
      <div class="hdr-r">
        <a class="pill" href="#" onclick="UPUI.toast('Shortlist: '+UPUI.favCount()+' saved');return false">${ico('heart')}Saved <span class="n" id="hdrFav">0</span></a>
        <a class="pill" href="#" onclick="UPUI.toast('Enquiries sent: '+UPUI.leadCount());return false">${ico('phone')}Enquiries <span class="n" id="hdrLead">0</span></a>
        <a href="#" style="padding:0 8px">Sign in</a><a class="btn-dark" href="#">For business</a>
      </div></div></header>`;
  }
  function updateHdrCounts() { const f = document.getElementById('hdrFav'), l = document.getElementById('hdrLead'); if (f) f.textContent = favs.size; if (l) l.textContent = (store.get('leads') || []).length; }
  function footer() {
    return `<div class="wrap"><section class="cta"><div><div style="font-size:11px;font-weight:800;letter-spacing:.12em;color:#9fd3b8;margin-bottom:14px">FOR PROVIDERS</div>
      <h2>List your offering.<br>Get leads in 42 minutes.</h2><p style="margin:16px 0 22px">Spaces, services, experiences, memberships, programs, health or protection — customers reach you directly by phone and WhatsApp.</p>
      <div style="display:flex;gap:10px"><a class="btn" style="background:#fff;color:var(--g9)">+ List an offering</a><a class="btn" style="border:1.5px solid rgba(255,255,255,.4)">How it works</a></div></div>
      <div class="stats"><div><b>12,000+</b><span>active listings</span></div><div><b>850+</b><span>verified providers</span></div><div><b>42 min</b><span>avg. first reply</span></div><div><b>0 AED</b><span>fees for customers</span></div></div></section></div>
      <footer class="foot"><div class="wrap"><b style="color:var(--ink)">UpNow</b><span>© 2026 UpNow Technologies FZ-LLC · Dubai, UAE</span><div class="sp"></div><a href="#">About</a><a href="#">Help centre</a><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Sitemap</a></div></footer>`;
  }

  /* ---------- engine ---------- */
  const offer = S => S.v === 'all' ? null : offerOf(S.v, S.o);
  const defsOf = S => { const O = offer(S); return O ? O.defs : []; };
  const toArr = x => Array.isArray(x) ? x.map(String) : [String(x)];
  const empty = v => v == null || v === '' || (Array.isArray(v) && !v.length);
  const priceOf = (l, S) => { const O = offerOf(l.v, l.cat); return O.priceOf ? O.priceOf(l, S && S.o === l.cat ? S : null) : l.price; };
  function fieldVal(d, l, S) { if (d.get) return d.get(l, S); if (d.id === 'price') return priceOf(l, S); const k = d.field || d.id; return l.a[k]; }
  function testDef(d, val, l, S) {
    if (empty(val) || d.noMatch) return true;
    const lv = fieldVal(d, l, S);
    if (d.type === 'range') return lv != null && (val.min == null || lv >= val.min) && (val.max == null || lv <= val.max);
    if (d.type === 'toggle') return !!lv;
    if (lv == null) return false;
    if (d.test) return d.test(lv, val);
    const arr = toArr(lv);
    if (d.type === 'multi') return d.all ? val.every(x => arr.includes(x)) : val.some(x => arr.includes(x));
    return arr.includes(String(val));
  }
  function matches(l, S, skip) {
    if (S.v !== 'all') { if (l.v !== S.v) return false; if (S.o && l.cat !== S.o) return false; }
    const O = offerOf(l.v, l.cat);
    if (S.loc.length && !O.locAll && !S.loc.some(id => l.loc === id || (l.coverage || []).includes(id))) return false;
    if (S.q) { const hay = (l.title + ' ' + (l.building || '') + ' ' + areaName(l.loc) + ' ' + l.provider.name + ' ' + O.label + ' ' + VERTICALS[l.v].label).toLowerCase(); if (!S.q.toLowerCase().split(/\s+/).filter(Boolean).every(w => hay.includes(w))) return false; }
    if (S.v !== 'all') for (const d of O.defs) { if (d.id === skip) continue; if (!testDef(d, S.f[d.id], l, S)) return false; }
    return true;
  }
  function results(S) {
    const r = LISTINGS.filter(l => matches(l, S));
    const so = {
      rec: (a, b) => (b.featured - a.featured) || (b.rating * Math.log(b.reviews + 2)) - (a.rating * Math.log(a.reviews + 2)),
      plh: (a, b) => priceOf(a, S) - priceOf(b, S), phl: (a, b) => priceOf(b, S) - priceOf(a, S),
      rating: (a, b) => b.rating - a.rating, new: (a, b) => a.posted - b.posted, fast: (a, b) => a.provider.reply - b.provider.reply
    };
    return r.sort(so[S.sort] || so.rec);
  }
  const facetCount = (S, id, value) => LISTINGS.filter(l => matches(l, { ...S, f: { ...S.f, [id]: value } })).length;
  const SORTS = [['rec', 'Recommended'], ['plh', 'Price: low to high'], ['phl', 'Price: high to low'], ['rating', 'Top rated'], ['new', 'Newest'], ['fast', 'Fastest reply']];

  /* ---------- URL state ---------- */
  function blankState(v, o) {
    v = VERTICALS[v] ? v : 'spaces';
    const O = v === 'all' ? null : offerOf(v, o);
    return { v, o: O ? O.id : null, q: '', loc: [], sort: 'rec', page: 1, view: 'list', f: O ? { ...(O.defaults || {}) } : {} };
  }
  function parseState(qs) {
    const p = new URLSearchParams(qs || location.search);
    const S = blankState(p.get('v'), p.get('o'));
    S.q = p.get('q') || ''; S.loc = (p.get('loc') || '').split(',').filter(x => areaById[x]);
    S.sort = p.get('sort') || 'rec'; S.page = +p.get('page') || 1; S.view = p.get('view') || 'list';
    defsOf(S).forEach(d => {
      if (d.type === 'range') { const a = p.get(d.id + '_min'), b = p.get(d.id + '_max'); if (a || b) S.f[d.id] = { min: a ? +a : null, max: b ? +b : null }; }
      else if (d.type === 'multi') { const x = p.get(d.id); if (x) S.f[d.id] = x.split(','); }
      else if (d.type === 'toggle') { if (p.get(d.id) === '1') S.f[d.id] = true; }
      else { const x = p.get(d.id); if (x) S.f[d.id] = x; }
    });
    return S;
  }
  function toQuery(S) {
    const p = new URLSearchParams(); p.set('v', S.v); if (S.o) p.set('o', S.o);
    if (S.loc.length) p.set('loc', S.loc.join(',')); if (S.q) p.set('q', S.q);
    defsOf(S).forEach(d => {
      const val = S.f[d.id]; if (empty(val)) return;
      if (d.type === 'range') { if (val.min != null) p.set(d.id + '_min', val.min); if (val.max != null) p.set(d.id + '_max', val.max); }
      else if (d.type === 'multi') p.set(d.id, val.join(','));
      else if (d.type === 'toggle') p.set(d.id, '1'); else p.set(d.id, val);
    });
    if (S.sort && S.sort !== 'rec') p.set('sort', S.sort);
    if (S.view && S.view !== 'list') p.set('view', S.view);
    if (S.page > 1) p.set('page', S.page);
    return '?' + p.toString().replace(/%2C/g, ',');
  }
  const fmtK = n => n >= 1000 ? UP.K(n) : String(n);
  function rangeLabel(r) { if (!r) return ''; if (r.min != null && r.max != null) return 'AED ' + fmtK(r.min) + '–' + fmtK(r.max); if (r.min != null) return 'AED ' + fmtK(r.min) + '+'; return 'Up to AED ' + fmtK(r.max); }
  function valueLabel(d, val) {
    if (empty(val)) return '';
    if (d.type === 'range') return rangeLabel(val);
    if (d.type === 'toggle') return d.label;
    const lab = x => (d.options.find(o => o.v === x) || {}).l || x;
    if (d.type === 'multi') { const ls = val.map(lab); return ls.length > 2 ? ls.slice(0, 2).join(', ') + ' +' + (ls.length - 2) : ls.join(', '); }
    return lab(val);
  }
  function factValue(d, l) {
    const lv = l.a[d.field || d.id];
    if (lv == null || d.type === 'range') return null;
    if (d.type === 'toggle') return lv ? 'Yes' : 'No';
    if (d.fmtFact) return d.fmtFact(lv);
    if (d.fmt) return d.fmt(lv);
    const lab = x => (d.options.find(o => o.v === String(x)) || {}).l || x;
    return Array.isArray(lv) ? lv.map(lab).join(', ') : lab(lv);
  }

  /* ---------- cards ---------- */
  const badges = l => `<div class="badges">${l.featured ? `<span class="bdg f">Featured</span>` : ''}${l.a.verified ? `<span class="bdg v">${ico('shield')}Verified</span>` : ''}</div>`;
  function photo(l, i = 0) {
    if (l.img && l.img.length) return `<img src="${l.img[i % l.img.length]}" alt="${esc(l.title)}" loading="lazy">`;
    const init = l.provider.name.split(/\s+/).map(s => s[0]).slice(0, 2).join('');
    const hue = { insurance: 165, programs: 200 }[l.v] || 150;
    return `<div class="tile" style="--h:${hue}"><b>${esc(init)}</b><span>${esc(l.provider.name)}</span><small>${esc(offerOf(l.v, l.cat).label)} insurance</small></div>`;
  }
  function priceText(l, S) { const O = offerOf(l.v, l.cat); const SS = S && S.o === l.cat ? S : null; const n = priceOf(l, SS); return { n: (O.from ? 'From ' : '') + 'AED ' + n.toLocaleString(), u: O.unit(l, SS) }; }
  function card(l, S) {
    const O = offerOf(l.v, l.cat), pt = priceText(l, S);
    return `<a class="card" href="Listing.html?id=${l.id}">
      <div class="ph">${photo(l)}${badges(l)}<button class="fav ${favs.has(l.id) ? 'on' : ''}" data-fav="${l.id}" aria-label="Save">${ico('heart')}</button></div>
      <div class="bd"><div class="t">${esc(l.title)}</div>
        <div class="loc">${ico('pin')}${esc(l.building ? l.building + ', ' : '')}${esc(O.locAll ? 'All UAE' : areaName(l.loc))}</div>
        <div class="meta">${O.meta(l.a, l).filter(([i]) => i !== 'star').slice(0, 3).map(([i, t]) => `<span>${ico(i)}${esc(t)}</span>`).join('')}</div>
        <div class="pr">${pt.n}<span>${pt.u}</span></div></div></a>`;
  }
  function tags(l) {
    const O = offerOf(l.v, l.cat); const out = [];
    O.optional.forEach(d => { if (d.id === 'verified' || d.id === 'price' || out.length >= 3) return; const lv = l.a[d.field || d.id]; if (d.type === 'toggle' && lv) out.push(d.label); else if (d.type === 'multi' && Array.isArray(lv) && lv.length) out.push(valueLabel(d, lv.slice(0, 1))); });
    return out.slice(0, 3);
  }

  /* ---------- lead capture ---------- */
  let scrim;
  function ensureModal() {
    if (scrim) return;
    scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.innerHTML = '<div class="modal" role="dialog"></div>';
    scrim.addEventListener('click', e => { if (e.target === scrim) closeModal(); }); document.body.appendChild(scrim);
    const t = document.createElement('div'); t.className = 'toast'; t.id = 'toast'; document.body.appendChild(t);
  }
  const closeModal = () => scrim.classList.remove('on');
  function openModal(html) { ensureModal(); scrim.firstChild.innerHTML = html; scrim.classList.add('on'); scrim.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal); }
  function toast(msg) { ensureModal(); const t = document.getElementById('toast'); t.innerHTML = ico('check') + esc(msg); t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2400); }
  const byId = id => LISTINGS.find(l => l.id === id);
  const fmtPhone = p => p.replace(/^\+971(\d{2})(\d{3})(\d{4})$/, '+971 $1 $2 $3');
  function waLink(l) { return 'https://wa.me/' + l.provider.phone.replace('+', '') + '?text=' + encodeURIComponent(`Hi ${l.provider.name}, I found your listing on UpNow and I'm interested.\n\n${l.title}\nRef ${l.ref}\n\nIs it available?`); }
  function providerHead(l) {
    const init = l.provider.name.split(/\s+/).map(s => s[0]).slice(0, 2).join('');
    return `<div style="display:flex;gap:12px;align-items:center"><div style="width:44px;height:44px;border-radius:50%;background:var(--g1);color:var(--g8);display:grid;place-items:center;font-weight:800;flex:none">${esc(init)}</div>
      <div><div style="font-weight:800">${esc(l.provider.name)}</div><div style="color:var(--ink3);font-size:12.5px">${esc(l.provider.org)} · replies in ~${l.provider.reply} min</div></div></div>`;
  }
  function call(id) {
    const l = byId(id); logLead('call', l);
    openModal(`<div class="mh"><h3>Call ${esc(l.provider.name.split(' ')[0])}</h3><button class="x" data-close>${ico('x')}</button></div>
      <div class="mb">${providerHead(l)}
        <a href="tel:${l.provider.phone}" style="display:flex;align-items:center;justify-content:center;gap:10px;margin:18px 0 10px;height:56px;border-radius:14px;background:var(--g1);color:var(--g8);font-size:22px;font-weight:800">${ico('phone')}${fmtPhone(l.provider.phone)}</a>
        <div style="background:var(--bg);border-radius:10px;padding:10px 12px;font-size:12.5px;color:var(--ink2)">Quote reference <b style="color:var(--ink)">${l.ref}</b> and mention you found this on UpNow.</div>
        <div style="display:flex;gap:8px;margin-top:14px"><a class="btn btn-wa" style="flex:1" href="${waLink(l)}" target="_blank">${ico('wa')}WhatsApp instead</a><button class="btn btn-o" style="flex:1" onclick="UPUI.request('${l.id}')">Request callback</button></div></div>`);
  }
  function whatsapp(id) { const l = byId(id); logLead('whatsapp', l); window.open(waLink(l), '_blank'); toast('Opening WhatsApp with your message…'); }
  function request(id) {
    const l = byId(id), O = offerOf(l.v, l.cat), pt = priceText(l);
    const fieldDefs = O.fields.filter(f => f !== 'loc').map(f => O.def(f)).filter(Boolean).slice(0, 4);
    openModal(`<div class="mh"><h3>${esc(O.action)}</h3><button class="x" data-close>${ico('x')}</button></div>
      <div class="mb">${providerHead(l)}<div style="margin:14px 0;padding:10px 12px;border:1px solid var(--line);border-radius:10px;font-size:12.5px"><b>${esc(l.title)}</b><br><span style="color:var(--ink3)">${pt.n}${pt.u} · Ref ${l.ref}</span></div>
      <form id="cbForm"><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="fld"><label>Full name</label><input required placeholder="Your name"></div>
        <div class="fld"><label>Mobile (WhatsApp)</label><input required value="+971 " inputmode="tel"></div>
        ${fieldDefs.map(d => `<div class="fld"><label>${esc(d.label)}</label>${d.isDate ? '<input type="date">' : d.options ? `<select><option>Any</option>${d.options.map(o => `<option>${esc(o.l)}</option>`).join('')}</select>` : '<input>'}</div>`).join('')}
      </div>
      <div class="fld"><label>Message (optional)</label><textarea placeholder="Anything the provider should know?"></textarea></div>
      <button class="btn btn-g" style="width:100%;height:46px">Send to ${esc(l.provider.name.split(' ')[0])}</button>
      <p style="font-size:11.5px;color:var(--ink3);margin:10px 0 0;text-align:center">The provider contacts you by phone or WhatsApp. No payment through UpNow.</p></form></div>`);
    document.getElementById('cbForm').onsubmit = e => { e.preventDefault(); logLead('request', l); closeModal(); toast(`Sent — ${l.provider.name.split(' ')[0]} usually replies in ~${l.provider.reply} min`); };
  }
  document.addEventListener('click', e => {
    const f = e.target.closest('[data-fav]'); if (f) { e.preventDefault(); e.stopPropagation(); toggleFav(f.dataset.fav); return; }
    const c = e.target.closest('[data-call]'); if (c) { e.preventDefault(); e.stopPropagation(); call(c.dataset.call); return; }
    const w = e.target.closest('[data-wa]'); if (w) { e.preventDefault(); e.stopPropagation(); whatsapp(w.dataset.wa); return; }
    const b = e.target.closest('[data-req]'); if (b) { e.preventDefault(); e.stopPropagation(); request(b.dataset.req); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && scrim) closeModal(); });

  window.UPUI = {
    ICONS: P, ico, esc, header, footer, updateHdrCounts, card, photo, badges, tags, priceText, priceOf, offer, defsOf, matches, results, facetCount, SORTS, TABS,
    blankState, parseState, toQuery, valueLabel, factValue, rangeLabel, empty, call, whatsapp, request, toast, favs, byId, providerHead,
    favCount: () => favs.size, leadCount: () => (store.get('leads') || []).length
  };
})();
