(() => {
  const page = document.body.dataset.page || '';
  const base = './';

  const navItems = [
    ['home', 'Home', 'index.html'],
    ['gallery', 'Gallery', 'gallery.html'],
    ['services', 'Services', 'services.html'],
    ['about', 'Our Vision', 'about.html'],
    ['contact', 'Contact', 'contact.html']
  ];

  const headerHost = document.querySelector('#site-header');
  if (headerHost) {
    headerHost.innerHTML = `
      <a class="skip-link" href="#main-content">Skip to content</a>
      <header class="site-header" data-header>
        <div class="header-inner">
          <a class="brand" href="${base}index.html" aria-label="Art Studio 184 home">
            <span class="brand-mark">184</span>
            <span class="brand-text"><span>Art Studio</span><span>Kyiv</span></span>
          </a>
          <nav class="site-nav" id="site-nav" aria-label="Main navigation">
            ${navItems.map(([key,label,url]) => `<a href="${base}${url}" ${page === key ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
            <a class="header-cta" href="${base}contact.html">Start a project</a>
          </nav>
          <button class="menu-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>`;
  }

  const footerHost = document.querySelector('#site-footer');
  if (footerHost) {
    footerHost.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-main">
          <div class="footer-brand">
            <a class="brand" href="${base}index.html" aria-label="Art Studio 184 home">
              <span class="brand-mark">184</span>
              <span class="brand-text"><span>Art Studio</span><span>Kyiv</span></span>
            </a>
            <p>Full-cycle creative production: sculptures, décor, photo zones, branded objects and custom installations.</p>
          </div>
          <div class="footer-col">
            <h3>Explore</h3>
            <a href="${base}gallery.html">Gallery</a>
            <a href="${base}services.html">Services</a>
            <a href="${base}about.html">Our Vision</a>
          </div>
          <div class="footer-col">
            <h3>Contact</h3>
            <a href="https://www.instagram.com/artstudio184_/" target="_blank" rel="noopener">Instagram ↗</a>
            <a href="https://www.behance.net/184artstudio" target="_blank" rel="noopener">Behance ↗</a>
            <span>Kyiv, Ukraine</span>
          </div>
          <div class="footer-col">
            <h3>Projects</h3>
            <a href="${base}contact.html">Send a brief</a>
            <a href="${base}gallery.html#characters">Sculptures</a>
            <a href="${base}gallery.html#installations">Installations</a>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© ${new Date().getFullYear()} Art Studio 184</span>
          <span>Designed around the work, not a template.</span>
        </div>
      </footer>`;
  }

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const setHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    toggle?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }));

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: .12 })
    : null;
  document.querySelectorAll('.reveal').forEach(el => observer ? observer.observe(el) : el.classList.add('is-visible'));

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(contactForm);
      const brief = [
        'ART STUDIO 184 — PROJECT BRIEF',
        '',
        `Name: ${data.get('name') || '—'}`,
        `Contact: ${data.get('contact') || '—'}`,
        `Project type: ${data.get('type') || '—'}`,
        `Timing: ${data.get('timing') || '—'}`,
        '',
        'Project details:',
        data.get('details') || '—'
      ].join('\n');
      const result = document.querySelector('[data-form-result]');
      const preview = document.querySelector('[data-brief-preview]');
      if (preview) preview.textContent = brief;
      result?.classList.add('is-visible');
      try {
        await navigator.clipboard.writeText(brief);
        const status = result?.querySelector('[data-copy-status]');
        if (status) status.textContent = 'Your brief has been copied. Open Instagram and paste it into a message.';
      } catch {
        const status = result?.querySelector('[data-copy-status]');
        if (status) status.textContent = 'Copy the brief below and send it through Instagram.';
      }
      result?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  document.querySelectorAll('[data-copy-brief]').forEach(button => button.addEventListener('click', async () => {
    const text = document.querySelector('[data-brief-preview]')?.textContent || '';
    try { await navigator.clipboard.writeText(text); button.textContent = 'Copied'; }
    catch { button.textContent = 'Select the text below'; }
  }));
})();
