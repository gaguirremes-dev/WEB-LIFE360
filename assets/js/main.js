/* ============================================================
   LIFE360 SEGUROS Y REASEGUROS — Main JS v1.0
   ============================================================ */

(function () {
  'use strict';

  // ── Utilities ────────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ── Scroll Progress ──────────────────────────────────────
  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (scrollTop / docHeight * 100) + '%';
    }, { passive: true });
  }

  // ── Header Behavior ──────────────────────────────────────
  function initHeader() {
    const header = $('#site-header');
    const menuBtn = $('#menu-toggle');
    const mobileMenu = $('#mobile-menu');
    const mobileLinks = $$('.mobile-nav-link');
    if (!header) return;

    let lastY = 0;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      lastY = y;
    }, { passive: true });

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        menuBtn.setAttribute('aria-expanded', isOpen);
        const icon = menuBtn.querySelector('[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
          lucide.createIcons();
        }
      });
      mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.remove('is-open');
          menuBtn.setAttribute('aria-expanded', 'false');
          const icon = menuBtn.querySelector('[data-lucide]');
          if (icon) {
            icon.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
          }
        });
      });
    }

    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id === '#') return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        const offset = header.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  // ── GSAP Hero Animations ─────────────────────────────────
  function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ delay: 0.15 });
    tl
      .from('.hero-badge',  { y: 20, opacity: 0, duration: 0.55, ease: 'power2.out' })
      .from('.hero-h1',     { y: 40, opacity: 0, duration: 0.75, ease: 'power3.out' }, '-=0.3')
      .from('.hero-sub',    { y: 28, opacity: 0, duration: 0.65, ease: 'power2.out' }, '-=0.45')
      .from('.hero-ctas',   { y: 20, opacity: 0, duration: 0.55, ease: 'power2.out' }, '-=0.35')
      .from('.hero-trust',  { y: 16, opacity: 0, duration: 0.50, ease: 'power2.out' }, '-=0.3')
      .from('.hero-visual', { x: 50, opacity: 0, duration: 0.85, ease: 'power2.out' }, '-=0.7');

    // Parallax on hero grid
    gsap.to('.hero-grid-bg', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  // ── Stats Counter ────────────────────────────────────────
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    const opts = { threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isDecimal = String(target).includes('.');
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, opts);

    counters.forEach(el => observer.observe(el));
  }

  // ── Scroll Animations (AOS handles these — GSAP solo para hero) ──
  function initScrollAnimations() {
    // Animaciones de scroll gestionadas por AOS en el HTML.
    // GSAP se reserva únicamente para la entrada del hero (initHeroAnimations).
  }

  // ── Form ─────────────────────────────────────────────────
  function initForm() {
    const form = $('#cotizacion-form');
    if (!form) return;

    const successMsg = $('#form-success');
    const submitBtn = form.querySelector('[type="submit"]');

    // RUC mask (11 digits)
    const rucInput = $('#field-ruc');
    if (rucInput) {
      rucInput.addEventListener('input', e => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 11);
      });
    }

    // Phone mask
    const telInput = $('#field-tel');
    if (telInput) {
      telInput.addEventListener('input', e => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 9);
      });
    }

    function validateField(field) {
      const val = field.value.trim();
      const errEl = field.parentElement.querySelector('.form-error-msg');
      let valid = true;
      let msg = '';

      field.classList.remove('error');
      if (errEl) errEl.classList.remove('is-visible');

      if (field.required && !val) {
        valid = false;
        msg = 'Este campo es obligatorio.';
      } else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        valid = false;
        msg = 'Ingrese un correo válido.';
      } else if (field.id === 'field-ruc' && val && val.length !== 11) {
        valid = false;
        msg = 'El RUC debe tener 11 dígitos.';
      } else if (field.id === 'field-tel' && val && val.length < 7) {
        valid = false;
        msg = 'Ingrese un número válido.';
      }

      if (!valid) {
        field.classList.add('error');
        if (errEl) {
          errEl.textContent = msg;
          errEl.classList.add('is-visible');
        }
      }
      return valid;
    }

    $$('.form-input, .form-select, .form-textarea').forEach(el => {
      el.addEventListener('blur', () => validateField(el));
      el.addEventListener('input', () => {
        if (el.classList.contains('error')) validateField(el);
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fields = $$('[required]', form);
      const allValid = fields.reduce((ok, f) => validateField(f) && ok, true);

      const checkbox = form.querySelector('[name="privacidad"]');
      if (!checkbox || !checkbox.checked) {
        const errEl = checkbox?.parentElement?.querySelector('.form-error-msg');
        if (errEl) { errEl.textContent = 'Debe aceptar la política de privacidad.'; errEl.classList.add('is-visible'); }
        return;
      }

      if (!allValid) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Enviando...';

      // Simulate async submit (replace with actual endpoint)
      await new Promise(r => setTimeout(r, 1600));

      form.style.display = 'none';
      if (successMsg) successMsg.classList.add('is-visible');
    });
  }

  // ── AOS Init ─────────────────────────────────────────────
  function initAOS() {
    if (typeof AOS === 'undefined') return;
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
    // Marca el HTML como AOS activo (activa las animaciones de ocultamiento)
    document.documentElement.classList.add('aos-ready');
  }

  // ── Active Nav Link on Scroll ────────────────────────────
  function initActiveNav() {
    const sections = $$('section[id]');
    const links = $$('.nav-link');
    if (!sections.length || !links.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle(
            'text-teal-600',
            l.getAttribute('href') === `#${id}`
          );
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ── Lucide Icons ─────────────────────────────────────────
  function initIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // ── Init ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    initScrollProgress();
    initHeader();
    initHeroAnimations();
    initCounters();
    initScrollAnimations();
    initForm();
    initAOS();
    initActiveNav();
  });

})();
