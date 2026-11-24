// Carrito simple (demostración: solo cuenta artículos)
const count = document.getElementById('cartCount');
let items = 0;
document.querySelectorAll('.add').forEach(btn => {
  btn.addEventListener('click', () => {
    items++;
    count.textContent = items;
    btn.textContent = 'Añadido ✓';
    setTimeout(() => (btn.textContent = 'Añadir'), 1200);
  });
});
document.getElementById('cartBtn').addEventListener('click', e => e.preventDefault());

// Filtro por categoría
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.card');
filters.forEach(f => {
  f.addEventListener('click', () => {
    filters.forEach(x => x.classList.remove('is-active'));
    f.classList.add('is-active');
    const cat = f.dataset.filter;
    cards.forEach(c => {
      c.hidden = !(cat === 'all' || c.dataset.cat === cat);
    });
  });
});

// Fotos: si existe img/prenda-N.jpg (N = 1..9) sustituye al cuadrado vacío.
cards.forEach(c => {
  if (c.querySelector('.card__img img')) return; // ya tiene foto
  const img = new Image();
  img.alt = c.querySelector('h3').textContent;
  img.onload = () => {
    const box = c.querySelector('.card__img');
    box.classList.remove('card__img--empty');
    box.innerHTML = '';
    box.appendChild(img);
  };
  img.src = 'img/' + c.dataset.photo + '.jpg';
});


// Camo Lab: tela con camuflaje generado al azar
(function () {
  const PAL = {
    rosa:  { name: 'rosa',  base: '#f4b3c6', cols: ['#c23a6c', '#6e1a45', '#1b1b1b', '#e27a9e'] },
    verde: { name: 'verde', base: '#86ad4f', cols: ['#2f5a26', '#1b1b1b', '#c9d84a', '#4f7f33'] },
    azul:  { name: 'azul',  base: '#4a8ad0', cols: ['#1e4f9a', '#0e2a5c', '#a8d4f0', '#2f6cb8'] },
    negro: { name: 'negro', base: '#2b2b2b', cols: ['#111111', '#4a4a4a', '#6d6d6d', '#1b1b1b'] }
  };
  const stage = document.getElementById('labStage'), patch = document.getElementById('labPatch');
  const blobsG = document.getElementById('labBlobs'), baseEl = document.getElementById('labBase');
  const chip = document.getElementById('labChip'), sw = document.getElementById('labSwatches');
  const NS = 'http://www.w3.org/2000/svg', N = 26;
  let cur = 'rosa', seed = 1, paths = [];

  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  function blob(r) {
    const cx = 20 + r() * 260, cy = 20 + r() * 280, rx = 28 + r() * 42, ry = 12 + r() * 22, rot = (r() - .5) * 1.2, k = 8, pts = [];
    for (let i = 0; i < k; i++) {
      const a = i / k * Math.PI * 2, v = .7 + r() * .45;
      const x = Math.cos(a) * rx * v, y = Math.sin(a) * ry * v;
      pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    let d = '';
    for (let i = 0; i < k; i++) {
      const p0 = pts[(i - 1 + k) % k], p1 = pts[i], p2 = pts[(i + 1) % k], p3 = pts[(i + 2) % k];
      if (!i) d += 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1);
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' +
                 (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' +
                 p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d + 'Z';
  }
  for (let i = 0; i < N; i++) { const p = document.createElementNS(NS, 'path'); blobsG.appendChild(p); paths.push(p); }

  function draw() {
    const r = rng(seed * 7919), pal = PAL[cur];
    baseEl.setAttribute('fill', pal.base);
    paths.forEach((p, i) => { p.setAttribute('d', blob(r)); p.setAttribute('fill', pal.cols[i % 4]); });
    chip.textContent = 'Camo ' + pal.name + ' · nº ' + String(seed).padStart(4, '0');
  }
  function shuffle() {
    seed = 1 + Math.floor(Math.random() * 9999);
    draw();
    stage.classList.remove('is-pop'); void stage.offsetWidth; stage.classList.add('is-pop');
  }

  Object.keys(PAL).forEach(k => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'swatch'; b.setAttribute('aria-label', 'Camo ' + PAL[k].name);
    b.setAttribute('aria-pressed', k === cur); b.style.background = PAL[k].base;
    b.addEventListener('click', () => {
      cur = k; sw.querySelectorAll('.swatch').forEach(x => x.setAttribute('aria-pressed', x === b)); draw();
      stage.classList.remove('is-pop'); void stage.offsetWidth; stage.classList.add('is-pop');
    });
    sw.appendChild(b);
  });

  patch.addEventListener('click', shuffle);
  document.getElementById('labShuffle').addEventListener('click', shuffle);

  // Inclinación 3D con el ratón
  if (matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stage.addEventListener('mousemove', e => {
      const b = stage.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5;
      patch.style.transform = 'rotateY(' + (x * 22).toFixed(1) + 'deg) rotateX(' + (-y * 22).toFixed(1) + 'deg)';
    });
    stage.addEventListener('mouseleave', () => { patch.style.transform = ''; });
  }
  draw();
})();


// Ficha de producto (se abre al pulsar la foto o el nombre)
(function () {
  const dlg = document.getElementById('prod');
  if (!dlg || !dlg.showModal) return;
  const $ = id => document.getElementById(id);
  const main = $('prodMain'), big = $('prodImg'), thumbs = $('prodThumbs'), sizesEl = $('prodSizes'), msg = $('prodMsg');
  let chosen = null;

  function setImg(img, btn) {
    big.src = img.src; big.alt = img.alt;
    thumbs.querySelectorAll('.prod__thumb').forEach(b => b.setAttribute('aria-pressed', b === btn));
    main.classList.remove('is-zoom');
  }
  function open(card) {
    const imgs = [...card.querySelectorAll('.card__img img')];
    thumbs.innerHTML = ''; sizesEl.innerHTML = ''; $('prodList').textContent = ''; msg.textContent = ''; chosen = null;
    imgs.forEach((im, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'prod__thumb';
      b.setAttribute('aria-label', i ? 'Ver parte trasera' : 'Ver parte delantera');
      const t = new Image(); t.src = im.src; t.alt = ''; b.appendChild(t);
      b.addEventListener('click', () => setImg(im, b)); thumbs.appendChild(b);
    });
    thumbs.style.display = imgs.length > 1 ? '' : 'none';
    setImg(imgs[0], thumbs.firstChild);
    $('prodTag').textContent = card.dataset.tag || '';
    $('prodTitle').textContent = card.querySelector('h3').textContent;
    $('prodPrice').textContent = card.querySelector('strong').textContent;
    $('prodDesc').textContent = card.dataset.desc || '';
    (card.dataset.sizes || 'S,M,L,XL').split(',').forEach(sz => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'size'; b.textContent = sz.trim();
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        chosen = b.textContent; msg.textContent = '';
        sizesEl.querySelectorAll('.size').forEach(x => x.setAttribute('aria-pressed', x === b));
      });
      sizesEl.appendChild(b);
    });
    let secs = []; try { secs = JSON.parse(card.dataset.sections || '[]'); } catch (e) {}
    secs.forEach((sec, k) => {
      const d = document.createElement('details'); if (k === 0) d.open = true;
      const sm = document.createElement('summary'); sm.textContent = sec.t; d.appendChild(sm);
      const ul = document.createElement('ul');
      sec.i.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
      d.appendChild(ul); $('prodList').appendChild(d);
    });
    document.documentElement.classList.add('is-locked');
    dlg.showModal(); dlg.scrollTop = 0;
  }
  function close() { dlg.close(); }
  dlg.addEventListener('close', () => document.documentElement.classList.remove('is-locked'));
  $('prodClose').addEventListener('click', close);
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });

  // zoom con clic y seguimiento del puntero
  main.addEventListener('click', () => main.classList.toggle('is-zoom'));
  main.addEventListener('mousemove', e => {
    const r = main.getBoundingClientRect();
    main.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%');
    main.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
  });

  $('prodAdd').addEventListener('click', () => {
    if (!chosen) { msg.textContent = 'Elige una talla primero.'; return; }
    items++; count.textContent = items;
    msg.textContent = 'Añadida al carrito (talla ' + chosen + ') ✓';
  });

  document.querySelectorAll('.card[data-desc]').forEach(card => {
    const box = card.querySelector('.card__img');
    box.tabIndex = 0; box.setAttribute('role', 'button'); box.setAttribute('aria-label', 'Ver ' + card.querySelector('h3').textContent);
    const go = () => open(card);
    box.addEventListener('click', go);
    box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    card.querySelector('h3').addEventListener('click', go);
  });
})();

// Newsletter: cada alta te llega por email (servicio gratuito FormSubmit)
// >>> Cambia esto por TU correo (el que quieres que reciba los avisos) <<<
const CORREO_AVISOS = 'TU_CORREO@gmail.com';
document.getElementById('newsForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target, msg = document.getElementById('newsMsg'), btn = form.querySelector('button');
  if (form.elements['_honey'].value) return; // antispam: un robot rellenó el campo oculto
  if (CORREO_AVISOS.indexOf('TU_CORREO') === 0) { msg.textContent = 'Falta configurar tu correo en el código (CORREO_AVISOS).'; return; }
  btn.disabled = true; msg.textContent = 'Enviando…';
  try {
    const r = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CORREO_AVISOS), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        email: form.elements['email'].value,
        _subject: 'Nueva suscripción a la lista de NotYet',
        _template: 'table'
      })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.success === 'false' || d.success === false) throw new Error('fallo');
    msg.textContent = '¡Estás dentro! Te avisamos del próximo drop.';
    form.reset();
  } catch (err) {
    msg.textContent = 'No se ha podido enviar. Inténtalo de nuevo en un momento.';
  }
  btn.disabled = false;
});

