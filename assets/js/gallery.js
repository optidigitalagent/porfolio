(() => {
  const host = document.querySelector('[data-gallery-host]');
  const filtersHost = document.querySelector('[data-gallery-filters]');
  const status = document.querySelector('[data-gallery-status]');
  if (!host || !filtersHost) return;

  const copy = [
    { id: 'characters', title: '3D Characters & Sculptures', description: 'Custom characters, mascots, props and sculptural objects made at the scale, finish and durability each project requires.' },
    { id: 'installations', title: 'Photo Zones & Installations', description: 'Immersive environments for events, launches, celebrations, performances and spaces that need a memorable focal point.' },
    { id: 'brand-displays', title: 'Brand Displays & Oversized Objects', description: 'Volumetric signage, giant product replicas, promotional structures and branded objects engineered to be noticed.' }
  ];

  const state = { categories: [], active: 'all', currentImages: [], currentIndex: 0 };
  const escapeHtml = value => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function scrollToCurrentHash(behavior = 'auto') {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!id || !state.categories.some(category => category.id === id)) return;
    const target = document.getElementById(id);
    if (!target) return;
    const header = document.querySelector('[data-header]')?.offsetHeight || 76;
    const toolbar = document.querySelector('.gallery-toolbar')?.offsetHeight || 0;
    const top = target.getBoundingClientRect().top + window.scrollY - header - toolbar - 12;
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  function parseSource(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return [...doc.querySelectorAll('.category-block')].slice(0, 3).map((block, index) => {
      const images = [...block.querySelectorAll('.photo-strip-item img')]
        .map(img => img.getAttribute('src')).filter(Boolean)
        .filter((src, i, arr) => arr.indexOf(src) === i);
      return { ...copy[index], images };
    }).filter(category => category.images.length);
  }

  function renderFilters() {
    const total = state.categories.reduce((sum, category) => sum + category.images.length, 0);
    const filters = [{ id: 'all', title: `All work · ${total}` }, ...state.categories];
    filtersHost.innerHTML = filters.map(item => `<button class="gallery-filter ${item.id === state.active ? 'is-active' : ''}" type="button" data-filter="${item.id}">${escapeHtml(item.title)}${item.images ? ` · ${item.images.length}` : ''}</button>`).join('');
    filtersHost.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      state.active = button.dataset.filter;
      renderFilters();
      host.querySelectorAll('.gallery-category').forEach(section => {
        section.hidden = state.active !== 'all' && section.dataset.category !== state.active;
      });
      const first = host.querySelector('.gallery-category:not([hidden])');
      if (first) {
        const header = document.querySelector('[data-header]')?.offsetHeight || 76;
        const toolbar = document.querySelector('.gallery-toolbar')?.offsetHeight || 0;
        window.scrollTo({ top: first.getBoundingClientRect().top + window.scrollY - header - toolbar - 12, behavior: 'smooth' });
      }
    }));
  }

  function renderGallery() {
    status?.remove();
    host.innerHTML = state.categories.map((category, categoryIndex) => `<section class="gallery-category" id="${category.id}" data-category="${category.id}"><div class="container"><div class="gallery-category-head reveal"><div><p class="eyebrow">0${categoryIndex + 1} / Portfolio</p><h2 class="h2">${escapeHtml(category.title)}</h2></div><div><p class="lead gallery-description">${escapeHtml(category.description)}</p><p class="gallery-category-count">${category.images.length} works</p></div></div><div class="gallery-grid">${category.images.map((src, index) => `<button class="gallery-card" type="button" data-category-index="${categoryIndex}" data-image-index="${index}" aria-label="Open ${escapeHtml(category.title)} image ${index + 1}"><img src="${escapeHtml(src)}" alt="${escapeHtml(category.title)} — project ${index + 1}" loading="lazy" decoding="async"></button>`).join('')}</div></div></section>`).join('');
    host.querySelectorAll('.gallery-card').forEach(card => card.addEventListener('click', () => {
      const category = state.categories[Number(card.dataset.categoryIndex)];
      state.currentImages = category.images;
      state.currentIndex = Number(card.dataset.imageIndex);
      openLightbox(category.title);
    }));
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    requestAnimationFrame(() => scrollToCurrentHash('auto'));
  }

  const lightbox = document.querySelector('[data-lightbox]');
  const image = document.querySelector('[data-lightbox-image]');
  const caption = document.querySelector('[data-lightbox-caption]');
  let currentTitle = '';
  const update = () => {
    if (!image) return;
    image.src = state.currentImages[state.currentIndex];
    image.alt = `${currentTitle} — project ${state.currentIndex + 1}`;
    if (caption) caption.textContent = `${currentTitle} · ${state.currentIndex + 1} / ${state.currentImages.length}`;
  };
  const openLightbox = title => {
    currentTitle = title; update();
    lightbox?.classList.add('is-open'); lightbox?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    document.querySelector('[data-lightbox-close]')?.focus();
  };
  const closeLightbox = () => {
    lightbox?.classList.remove('is-open'); lightbox?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  };
  const move = direction => {
    state.currentIndex = (state.currentIndex + direction + state.currentImages.length) % state.currentImages.length;
    update();
  };
  document.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
  document.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => move(-1));
  document.querySelector('[data-lightbox-next]')?.addEventListener('click', () => move(1));
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (!lightbox?.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
  window.addEventListener('hashchange', () => scrollToCurrentHash('smooth'));

  fetch('./gallery-data.html')
    .then(response => { if (!response.ok) throw new Error(`Gallery source failed: ${response.status}`); return response.text(); })
    .then(parseSource)
    .then(categories => {
      if (!categories.length) throw new Error('No gallery categories found');
      state.categories = categories; renderFilters(); renderGallery();
    })
    .catch(error => {
      console.error(error);
      if (status) status.innerHTML = '<div><strong>Gallery could not be loaded.</strong><br><span class="small">Refresh this page or view the studio on Behance.</span></div>';
    });
})();
