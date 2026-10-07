/* ===== Edit your skills here ===== */
const SKILLS = {
  Electronics: ['Digital Electronics', 'Circuit Design', 'Sensors', 'Embedded Systems', 'PCB Design'],
  Programming: ['Python', 'HTML', 'CSS', 'JavaScript'],
  Design: ['EasyEDA', 'Fusion 360', 'Circuit Simulation']
};
// Cross-links between skills that are used together
const LINKS = [
  ['PCB Design', 'EasyEDA'], ['Circuit Design', 'Circuit Simulation'], ['Embedded Systems', 'Python'],
  ['Sensors', 'Embedded Systems'], ['HTML', 'CSS'], ['CSS', 'JavaScript'], ['Fusion 360', 'PCB Design']
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Footer year */
$('#yr').textContent = new Date().getFullYear();

/* Mobile menu */
const burger = $('.burger'), menu = $('#menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
$$('#menu a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open'); burger.setAttribute('aria-expanded', false);
}));

/* Active nav link */
const links = $$('#menu a');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.hash === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section').forEach(s => spy.observe(s));

/* Scroll reveal (one gentle pass on key blocks) */
const rvTargets = $$('.about-grid, .interests li, .proj, .map, .timeline li, .act, .links a');
rvTargets.forEach((el, i) => { el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 70 + 'ms'; });
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
rvTargets.forEach(el => io.observe(el));

/* Activity cards: tap to expand on touch devices */
$$('.act').forEach(b => b.addEventListener('click', () =>
  b.setAttribute('aria-expanded', b.getAttribute('aria-expanded') !== 'true')));

/* Hero background: faint dot grid that lights up near the cursor */
(function grid() {
  const c = $('#grid'), ctx = c.getContext('2d'), gap = 36;
  let w, h, mx = -999, my = -999, raf;
  const fg = () => matchMedia('(prefers-color-scheme: dark)').matches ? '236,232,225' : '27,27,30';
  const size = () => { const r = c.getBoundingClientRect(), d = devicePixelRatio || 1;
    w = c.width = r.width * d; h = c.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); w /= d; h /= d; };
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (let x = gap / 2; x < w; x += gap) for (let y = gap / 2; y < h; y += gap) {
      const d = Math.hypot(x - mx, y - my), t = Math.max(0, 1 - d / 160);
      ctx.fillStyle = t ? `rgba(163,58,82,${.25 + t * .75})` : `rgba(${fg()},.14)`;
      ctx.beginPath(); ctx.arc(x, y, 1.2 + t * 2.2, 0, 6.3); ctx.fill();
    }
    raf = 0;
  };
  const queue = () => raf || (raf = requestAnimationFrame(draw));
  size(); draw();
  addEventListener('resize', () => { size(); queue(); });
  if (!reduced) $('#home').addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; queue();
  });
  $('#home').addEventListener('pointerleave', () => { mx = my = -999; queue(); });
})();

/* Skills network */
(function skillsMap() {
  const map = $('#map');
  const groups = Object.keys(SKILLS);
  const nodes = [{ id: 'NTJ', x: 50, y: 50, hub: true }];
  const spots = { Electronics: [[18, 14], [8, 42], [20, 72], [38, 88], [34, 30]], Programming: [[82, 16], [92, 42], [78, 70], [62, 86]], Design: [[50, 10], [66, 30], [56, 68]] };
  groups.forEach(g => SKILLS[g].forEach((s, i) => {
    const [x, y] = spots[g][i] || [50, 50]; nodes.push({ id: s, g, x, y });
  }));
  const edges = nodes.filter(n => !n.hub).map(n => [ 'NTJ', n.id ]).concat(LINKS);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
  const pos = Object.fromEntries(nodes.map(n => [n.id, n]));
  const lines = edges.map(([a, b]) => {
    const l = document.createElementNS(ns, 'line');
    l.setAttribute('x1', pos[a].x); l.setAttribute('y1', pos[a].y); l.setAttribute('x2', pos[b].x); l.setAttribute('y2', pos[b].y);
    l.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(l); return { l, a, b };
  });
  map.appendChild(svg);
  const els = {};
  nodes.forEach(n => {
    const b = document.createElement('button');
    b.className = 'nd' + (n.hub ? ' hub' : ''); b.textContent = n.id; if (n.g) b.dataset.g = n.g;
    b.style.left = n.x + '%'; b.style.top = n.y + '%'; map.appendChild(b); els[n.id] = b;
    const on = () => {
      lines.forEach(({ l, a, b: bb }) => { const hit = a === n.id || bb === n.id; l.classList.toggle('hot', hit);
        if (hit) els[a === n.id ? bb : a].classList.add('hot'); });
    };
    const off = () => { lines.forEach(({ l }) => l.classList.remove('hot')); Object.values(els).forEach(e => e.classList.remove('hot')); };
    ['mouseenter', 'focus'].forEach(ev => b.addEventListener(ev, on));
    ['mouseleave', 'blur'].forEach(ev => b.addEventListener(ev, off));
  });
})();

/* ===== Extras ===== */
/* Scroll progress trace */
(function () {
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.prepend(bar);
  const up = () => bar.style.transform = `scaleX(${scrollY / (document.documentElement.scrollHeight - innerHeight || 1)})`;
  addEventListener('scroll', up, { passive: true }); up();
})();

/* Custom cursor: dot + trailing ring (mouse devices only) */
(function () {
  if (reduced || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const dot = Object.assign(document.createElement('div'), { className: 'cur-dot' });
  const ring = Object.assign(document.createElement('div'), { className: 'cur-ring' });
  document.body.append(dot, ring);
  let x = 0, y = 0, rx = 0, ry = 0;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; document.body.classList.add('cur-on'); });
  document.addEventListener('mouseleave', () => document.body.classList.remove('cur-on'));
  (function loop() {
    rx += (x - rx) * .16; ry += (y - ry) * .16;
    dot.style.transform = `translate(${x}px,${y}px)`; ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
  document.addEventListener('pointerover', e => ring.classList.toggle('big', !!e.target.closest('a,button,.proj')));
})();

/* Name decode effect on load */
(function () {
  const h = $('.hero h1'); h.setAttribute('aria-label', 'Namitha TJ');
  if (reduced) return;
  const nodes = [...h.childNodes].filter(n => n.nodeType === 3), orig = nodes.map(n => n.data);
  const set = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'; let f = 0; const total = 30;
  const t = setInterval(() => {
    f++;
    nodes.forEach((n, i) => n.data = [...orig[i]].map((c, k) => k < f * orig[i].length / total ? c : set[Math.random() * set.length | 0]).join(''));
    if (f >= total) { clearInterval(t); nodes.forEach((n, i) => n.data = orig[i]); }
  }, 45);
})();

/* Terminal typing line */
(function () {
  const el = $('#typed'), lines = ['> status: building', '> stack: electronics + code', '> next: your idea'];
  if (reduced) { el.textContent = lines[0]; return; }
  let l = 0, c = 0, del = false;
  (function tick() {
    const s = lines[l];
    el.textContent = s.slice(0, c);
    if (!del && c === s.length) { del = true; return setTimeout(tick, 1600); }
    if (del && c === 0) { del = false; l = (l + 1) % lines.length; }
    c += del ? -1 : 1; setTimeout(tick, del ? 25 : 65);
  })();
})();

/* Magnetic buttons + cursor glow on cards */
$$('.btn').forEach(b => {
  if (reduced) return;
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
  b.addEventListener('pointerleave', () => b.style.transform = '');
});
$$('.proj, .act').forEach(c => c.addEventListener('pointermove', e => {
  const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px');
}));
