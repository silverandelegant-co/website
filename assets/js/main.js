/* ============================================================
   SILVER & ELEGANT — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ───────────────────────────────────────────── */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }
  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  /* ── Data path ─────────────────────────────────────────── */
  function dataPath() {
    const depth = window.location.pathname.replace(/\/$/, '').split('/').length - 2;
    return depth > 0 ? '../'.repeat(depth) : '';
  }

  async function loadPieces() {
    // Append a timestamp to bypass aggressive browser caching
    const cacheBuster = new Date().getTime();
    const res = await fetch(`${dataPath()}data/collections.json?v=${cacheBuster}`);
    return res.json();
  }

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

  /* ── 4. Card renderer ──────────────────────────────────── */
  function renderCard(piece, prefix) {
    return `
      <article class="piece-card reveal">
        <a href="${prefix}piece/index.html?id=${piece.id}" class="piece-card-link" aria-label="${piece.name}">
          <div class="piece-card-image">
            <img src="${prefix}${piece.images[0]}" alt="${piece.name}" loading="lazy">
          </div>
          <div class="piece-card-content">
            <span class="piece-collection">${piece.collection}</span>
            <h3 class="piece-name">${piece.name}</h3>
            <p class="piece-tagline">${piece.tagline}</p>
            <span class="piece-link">Discover the story →</span>
          </div>
        </a>
      </article>`;
  }

  /* ── 5. Home page: featured pieces ────────────────────── */
  const featuredGrid = $('#featured-grid');
  if (featuredGrid) {
    loadPieces().then(data => {
      const featured = data.pieces.filter(p => p.featured).slice(0, 3);
      featuredGrid.innerHTML = featured.map(p => renderCard(p, '')).join('');
      // Re-observe new cards
      $$('.piece-card', featuredGrid).forEach(el => {
        if ('IntersectionObserver' in window) {
          const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
            });
          }, { threshold: 0.1 });
          obs.observe(el);
        } else {
          el.classList.add('visible');
        }
      });
    }).catch(console.error);
  }

  /* ── 6. Collections page ───────────────────────────────── */
  const collectionsGrid = $('#collections-grid');
  if (collectionsGrid) {
    const urlParams = new URLSearchParams(window.location.search);
    let activeFilter = urlParams.get('filter') || 'all';

    function renderCollections(pieces, filter) {
      const filtered = filter === 'all' ? pieces : pieces.filter(p => p.collection === filter);
      collectionsGrid.innerHTML = filtered.map(p => renderCard(p, '../')).join('');
      $$('.piece-card', collectionsGrid).forEach(el => el.classList.add('visible'));
    }

    loadPieces().then(data => {
      renderCollections(data.pieces, activeFilter);

      // Clear any hardcoded active classes
      $$('[data-filter]').forEach(b => b.classList.remove('active'));

      $$('[data-filter]').forEach(btn => {
        if (btn.dataset.filter === activeFilter) btn.classList.add('active');
        btn.addEventListener('click', () => {
          activeFilter = btn.dataset.filter;
          $$('[data-filter]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          renderCollections(data.pieces, activeFilter);
          
          if (window.history.replaceState) {
            window.history.replaceState(null, '', '?filter=' + activeFilter);
          }
        });
      });
    }).catch(console.error);
  }

  /* ── 7. Single piece page ──────────────────────────────── */
  const pieceContainer = $('#piece-container');
  if (pieceContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const pieceId = urlParams.get('id');

    loadPieces().then(data => {
      const piece = data.pieces.find(p => p.id === pieceId);
      if (!piece) {
        pieceContainer.innerHTML = '<div class="container" style="padding:10rem 2rem;text-align:center"><p>Piece not found.</p><a href="../collections/" class="btn btn-text" style="margin-top:1rem">View all pieces →</a></div>';
        return;
      }

      // Page title
      document.title = `${piece.name} — Silver & Elegant`;

      // Hero image
      const heroImg = $('#piece-hero-img');
      if (heroImg) {
        heroImg.src = `../${piece.images[0]}`;
        heroImg.alt = piece.name;
      }

      // Sidebar
      const nameEl = $('#piece-name');
      const collEl = $('#piece-collection');
      if (nameEl) nameEl.textContent = piece.name;
      if (collEl) collEl.textContent = piece.collection;

      // Materials
      const matList = $('#piece-materials');
      if (matList) {
        matList.innerHTML = piece.materials.map(m => `<li>${m}</li>`).join('');
      }

      // Wolf & Badger link
      const wbLink = $('#piece-wb-link');
      if (wbLink && piece.wolfandbadger) wbLink.href = piece.wolfandbadger;

      // Story
      const storyEl = $('#piece-story');
      if (storyEl) {
        storyEl.innerHTML = piece.story
          .split('\n\n')
          .map(para => `<p>${para}</p>`)
          .join('');
      }

      // Show container
      pieceContainer.style.opacity = '1';
    }).catch(console.error);
  }

})();
