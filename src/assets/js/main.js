/* ============================================================
   SILVER & ELEGANT — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ───────────────────────────────────────────── */
  const $ = (selector, context) => (context || document).querySelector(selector);
  const $$ = (selector, context) => Array.from((context || document).querySelectorAll(selector));

  /* ── 0. Analytics ──────────────────────────────────────── */
  const gaObj = document.createElement('script');
  gaObj.async = true;
  gaObj.src = 'https://www.googletagmanager.com/gtag/js?id=G-963J5RQ48V';
  document.head.appendChild(gaObj);
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ window.dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', 'G-963J5RQ48V');

  /* ── 1. Nav: scroll behaviour ──────────────────────────── */
  const nav = $('#nav');
  if (nav) {
    const hasHero = !!$('.hero');
    const onScroll = () => nav.classList.toggle('scrolled', !hasHero || window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2. Mobile nav toggle ──────────────────────────────── */
  const navToggle = $('#nav-toggle');
  const navLinks  = $('#nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 3. Scroll reveal ──────────────────────────────────── */
  const reveals = $$('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  /* ── 4. Collections Category Filter ──────────────────────── */
  const collectionsGrid = $('#collections-grid');
  if (collectionsGrid) {
    const urlParams = new URLSearchParams(window.location.search);
    let activeFilter = urlParams.get('filter') || 'all';
    const filterBtns = $$('[data-filter]');
    const pieces = $$('.piece-item', collectionsGrid);

    function applyFilter(filter) {
      pieces.forEach(p => {
        if (filter === 'all' || p.dataset.category === filter) {
          p.style.display = '';
          setTimeout(() => p.classList.add('visible'), 50); // slight delay for reveal transition
        } else {
          p.style.display = 'none';
          p.classList.remove('visible');
        }
      });
    }

    // Apply init filter
    applyFilter(activeFilter);
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === activeFilter);
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(activeFilter);
        
        if (window.history.replaceState) {
          window.history.replaceState(null, '', '?filter=' + activeFilter);
        }
      });
    });
  }

})();
