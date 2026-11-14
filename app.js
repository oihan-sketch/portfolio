(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const PHOTOS = window.PHOTOS || [];
  const VIDEOS = window.VIDEOS || [];
  const pad = n => String(n).padStart(2, '0');
  const full = (slug, f) => `assets/photos/${slug}/${f}`;
  const thumb = (slug, f) => `assets/thumbs/${slug}/${f}`;

  $('#year').textContent = new Date().getFullYear();

  /* ---------- HERO : enchaînement de vidéos ---------- */
  // Ordre de passage sur l'accueil. max = secondes affichées ; portrait = clip vertical ; bg = image floutée derrière.
  const REEL = [
    { src: 'assets/videos/circus.mp4', title: 'Circus', max: 9 },
    { src: 'assets/reel/finale-elite1.mp4', title: 'Finale Élite 1', portrait: true, bg: 'assets/videos/129LQpP9lLj-b5Si6akUyGFR_zGg51j9Y.jpg' },
    { src: 'assets/reel/voyage-memories.mp4', title: 'Memories — Voyage', portrait: true, bg: 'assets/videos/ig-DV6ppijjTh_.jpg' },
    { src: 'assets/reel/supercoupe.mp4', title: 'Aftermovie Supercoupe' },
    { src: 'assets/reel/essai-matiu.mp4', title: 'Matiu — Essai', portrait: true, bg: 'assets/videos/1FR-Y_7O4gAK23IR578EhVmz_pZWdbMXu.jpg' },
  ];
  (() => {
    const layers = [...document.querySelectorAll('#heroReel .hero__layer')];
    const now = $('#heroNow');
    if (!layers.length) return;
    let i = 0, cur = 0, timer = null;
    const setup = (layer, item) => {
      const v = layer.querySelector('video');
      layer.classList.toggle('portrait', !!item.portrait);
      layer.style.setProperty('--bg', item.bg ? `url("${item.bg}")` : 'none');
      if (!v.src.endsWith(item.src)) { v.src = item.src; v.load(); }
      return v;
    };
    const show = () => {
      const item = REEL[i];
      const layer = layers[cur], v = setup(layer, item);
      v.currentTime = 0;
      v.play().catch(() => {});
      layers.forEach(l => l.classList.toggle('is-on', l === layer));
      layers.forEach(l => { if (l !== layer) setTimeout(() => l.querySelector('video').pause(), 1200); });
      now.textContent = item.title;
      // précharge le suivant dans l'autre calque
      const next = REEL[(i + 1) % REEL.length];
      setup(layers[1 - cur], next);
      clearTimeout(timer);
      const advance = () => { i = (i + 1) % REEL.length; cur = 1 - cur; show(); };
      v.onended = advance;
      const lim = item.max || 0;
      if (lim) timer = setTimeout(advance, lim * 1000);
      v.onerror = advance;
    };
    show();
  })();

  /* ---------- VIDEO ---------- */
  const grid = $('#videoGrid');
  const filters = $('#videoFilters');
  const cats = ['Tout', ...new Set(VIDEOS.map(v => v.cat))];

  filters.innerHTML = cats.map((c, i) => {
    const n = c === 'Tout' ? VIDEOS.length : VIDEOS.filter(v => v.cat === c).length;
    return `<button role="tab" aria-selected="${i === 0}" data-cat="${c}">${c}<sup>${n}</sup></button>`;
  }).join('');

  grid.innerHTML = VIDEOS.map((v, i) => `
    <button class="vcard reveal${v.landscape ? ' vcard--wide' : ''}" data-i="${i}" data-cat="${v.cat}">
      <div class="vcard__media">
        <img src="${v.thumb || `assets/videos/${v.id}.jpg`}" alt="${v.title}" loading="lazy">
        <span class="vcard__play">▶</span>
      </div>
      <div class="vcard__info"><span class="vcard__title">${v.title}</span><span class="vcard__cat">${v.cat}</span></div>
    </button>`).join('');

  filters.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filters.querySelectorAll('button').forEach(x => x.setAttribute('aria-selected', x === b));
    const c = b.dataset.cat;
    grid.querySelectorAll('.vcard').forEach(card => card.classList.toggle('is-hidden', c !== 'Tout' && card.dataset.cat !== c));
  });

  const player = $('#player'), frame = $('#playerFrame');
  grid.addEventListener('click', e => {
    const card = e.target.closest('.vcard'); if (!card) return;
    const v = VIDEOS[card.dataset.i];
    const ig = v.source === 'instagram';
    frame.className = 'player__frame' + (v.landscape ? ' wide' : '') + (ig ? ' ig' : '');
    const url = ig ? `https://www.instagram.com/reel/${v.id}/embed/` : `https://drive.google.com/file/d/${v.id}/preview`;
    frame.innerHTML = `<iframe src="${url}" allow="autoplay; fullscreen; encrypted-media" allowfullscreen scrolling="no"></iframe>`;
    $('#playerTitle').textContent = v.title;
    player.hidden = false; document.body.classList.add('locked');
  });
  const closePlayer = () => { player.hidden = true; frame.innerHTML = ''; document.body.classList.remove('locked'); };
  player.addEventListener('click', e => { if (e.target === player || e.target.closest('[data-close]')) closePlayer(); });

  /* ---------- PHOTO (mise en avant) ---------- */
  const pick = p => (p.featured || [0, 1, 2, 3, 4]).map(k => p.images[k]).filter(Boolean);
  const feats = PHOTOS.filter(p => p.tier === 1);
  const second = PHOTOS.filter(p => p.tier === 2);
  const others = PHOTOS.filter(p => !p.tier || p.tier >= 3);

  const featureHTML = (p, n) => {
    const imgs = pick(p);
    return `
    <article class="feature feature--${p.tier === 1 ? 'main' : 'second'} reveal">
      <a class="feature__head" href="#/photo/${p.slug}">
        <span class="feature__num">${pad(n)}</span>
        <h3 class="feature__title">${p.title}</h3>
        <span class="feature__meta">${p.images.length} images <span class="feature__go">Voir la série →</span></span>
      </a>
      <div class="feature__grid">
        ${imgs.map(([f, w, h], k) => `<a href="#/photo/${p.slug}" class="feature__img${k === 0 && p.tier === 1 ? ' feature__img--big' : ''}">
          <img src="${(k === 0 && p.tier === 1 ? full : thumb)(p.slug, f)}" alt="${p.title}" loading="lazy"></a>`).join('')}
      </div>
    </article>`;
  };
  $('#photoFeatures').innerHTML =
    feats.map((p, i) => featureHTML(p, i + 1)).join('') +
    second.map((p, i) => featureHTML(p, feats.length + i + 1)).join('');
  $('#photoOthers').innerHTML = others.length
    ? `<span>Autres séries</span>` + others.map(p => `<a href="#/photo/${p.slug}">${p.title}</a>`).join('')
    : '';

  /* ---------- GALLERY ---------- */
  const home = $('#home'), gallery = $('#gallery');
  let current = null;

  function openGallery(slug) {
    const i = PHOTOS.findIndex(p => p.slug === slug);
    if (i < 0) return route('#/photo');
    const p = PHOTOS[i]; current = p;
    $('#galleryMeta').textContent = `Série ${pad(i + 1)} / ${pad(PHOTOS.length)} — ${p.year} — ${p.images.length} images`;
    $('#galleryTitle').textContent = p.title;
    $('#galleryDesc').textContent = p.desc || '';
    $('#galleryNav').innerHTML = PHOTOS.map(x => `<a href="#/photo/${x.slug}" class="${x.slug === slug ? 'active' : ''}">${x.title}</a>`).join('');
    $('#galleryGrid').innerHTML = p.images.map(([f, w, h], k) =>
      `<a href="${full(p.slug, f)}" data-k="${k}"><img src="${thumb(p.slug, f)}" width="${w}" height="${h}" alt="${p.title} ${k + 1}" loading="lazy"></a>`).join('');
    $('#galleryGrid').querySelectorAll('img').forEach(img => {
      if (img.complete) img.classList.add('loaded'); else img.onload = () => img.classList.add('loaded');
    });
    const next = PHOTOS[(i + 1) % PHOTOS.length];
    const nx = $('#galleryNext');
    nx.href = `#/photo/${next.slug}`;
    nx.innerHTML = `<small>Série suivante</small><strong>${next.title} →</strong>`;
    home.hidden = true; gallery.hidden = false;
    document.title = `${p.title} — Oihan Hargain`;
    window.scrollTo(0, 0);
  }

  /* ---------- LIGHTBOX ---------- */
  const lb = $('#lightbox'), lbImg = $('#lightboxImg');
  let lbIndex = 0;
  function showLb(k) {
    const n = current.images.length;
    lbIndex = (k + n) % n;
    lbImg.src = full(current.slug, current.images[lbIndex][0]);
    $('#lightboxCount').textContent = `${pad(lbIndex + 1)} / ${pad(n)}`;
    // preload neighbour
    new Image().src = full(current.slug, current.images[(lbIndex + 1) % n][0]);
  }
  $('#galleryGrid').addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    showLb(+a.dataset.k); lb.hidden = false; document.body.classList.add('locked');
  });
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('locked'); };
  lb.addEventListener('click', e => {
    if (e.target.closest('[data-prev]')) return showLb(lbIndex - 1);
    if (e.target.closest('[data-next]')) return showLb(lbIndex + 1);
    if (e.target.closest('[data-close]') || e.target === lb || e.target.classList.contains('lightbox__figure')) closeLb();
  });
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
  });
  document.addEventListener('keydown', e => {
    if (!lb.hidden) {
      if (e.key === 'ArrowRight') showLb(lbIndex + 1);
      if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      if (e.key === 'Escape') closeLb();
    } else if (!player.hidden && e.key === 'Escape') closePlayer();
  });

  /* ---------- ROUTER ---------- */
  function route(hash) {
    if (hash !== undefined && location.hash !== hash) { location.hash = hash; return; }
    const h = location.hash.replace(/^#\/?/, '');
    const [section, slug] = h.split('/');
    if (!player.hidden) closePlayer();
    if (!lb.hidden) closeLb();
    document.querySelectorAll('[data-link]').forEach(a => a.classList.toggle('active', a.dataset.link === section));
    if (section === 'photo' && slug) return openGallery(slug);
    current = null;
    const wasGallery = !gallery.hidden;
    gallery.hidden = true; home.hidden = false;
    document.title = 'Oihan Hargain — Photographe & Vidéaste';
    const target = section && document.getElementById(section);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ behavior: wasGallery ? 'auto' : 'smooth' }));
    } else {
      window.scrollTo({ top: 0, behavior: wasGallery ? 'auto' : 'smooth' });
    }
    observe();
  }
  window.addEventListener('hashchange', () => route());
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#/"]');
    if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); route(); }
  });

  /* ---------- REVEAL ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observe() {
    document.querySelectorAll('.reveal:not(.in)').forEach((el, i) => {
      if (!io) return el.classList.add('in');
      el.style.transitionDelay = `${(i % 6) * 60}ms`;
      io.observe(el);
    });
  }

  route();
})();
