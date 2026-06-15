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
  const navOverlay = $('#nav-overlay');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      if (navOverlay) navOverlay.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.classList.toggle('open', open);
      
      if (open) {
        nav.classList.add('nav-menu-open');
        nav.classList.remove('nav-menu-closing');
      } else {
        nav.classList.remove('nav-menu-open');
        nav.classList.add('nav-menu-closing');
        setTimeout(() => {
          nav.classList.remove('nav-menu-closing');
        }, 300);
      }
      
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('open');
        navToggle.classList.remove('open');
        
        nav.classList.remove('nav-menu-open');
        nav.classList.add('nav-menu-closing');
        setTimeout(() => {
          nav.classList.remove('nav-menu-closing');
        }, 300);
        
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

    const emptyState = $('#collections-empty');

    function applyFilter(filter) {
      let visibleCount = 0;
      pieces.forEach(p => {
        if (filter === 'all' || p.dataset.category === filter) {
          p.style.display = '';
          setTimeout(() => p.classList.add('visible'), 50); // slight delay for reveal transition
          visibleCount++;
        } else {
          p.style.display = 'none';
          p.classList.remove('visible');
        }
      });
      
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }
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

  /* ── 5. Email Obfuscation & Copy to Clipboard ───────────── */
  const decodeEmail = (obfuscated) => obfuscated.split('').reverse().join('');

  $$('.obfuscated-email').forEach(link => {
    const obfuscated = link.dataset.email;
    if (obfuscated) {
      const email = decodeEmail(obfuscated);
      const setMailto = () => link.setAttribute('href', 'mailto:' + email);
      link.addEventListener('pointerenter', setMailto);
      link.addEventListener('focus', setMailto);
      link.addEventListener('click', setMailto);
    }
  });

  $$('.copy-email-btn').forEach(btn => {
    const copyIcon = $('.copy-icon', btn);
    const checkIcon = $('.check-icon', btn);
    const tooltip = $('.tooltip', btn);
    const obfuscated = btn.dataset.email;

    btn.addEventListener('click', () => {
      if (obfuscated) {
        const email = decodeEmail(obfuscated);
        navigator.clipboard.writeText(email).then(() => {
          btn.classList.add('copied');
          if (tooltip) tooltip.textContent = 'Copied!';
          if (copyIcon) copyIcon.style.display = 'none';
          if (checkIcon) checkIcon.style.display = 'block';

          setTimeout(() => {
            btn.classList.remove('copied');
            if (tooltip) tooltip.textContent = 'Copy';
            if (copyIcon) copyIcon.style.display = 'block';
            if (checkIcon) checkIcon.style.display = 'none';
          }, 2000);
        }).catch(err => {
          console.error('Clipboard copy failed:', err);
        });
      }
    });
  });

  /* ── 6. Contact Form Submission (Web3Forms AJAX) ────────── */
  const contactForm = $('#contact-form');
  if (contactForm) {
    const submitBtn = $('#contact-submit', contactForm);
    const btnText = $('.submit-text', submitBtn);
    const btnLoader = $('.btn-loader', submitBtn);
    const successAlert = $('.success-result');
    const errorAlert = $('.error-result');

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Hide any previous alerts
      if (successAlert) successAlert.style.display = 'none';
      if (errorAlert) errorAlert.style.display = 'none';

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
      }

      const formData = new FormData(contactForm);
      const json = JSON.stringify(Object.fromEntries(formData));

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      })
      .then(async (response) => {
        let result = await response.json();
        if (response.status === 200) {
          // Success
          if (successAlert) successAlert.style.display = 'flex';
          contactForm.reset();
          contactForm.style.display = 'none';
        } else {
          // API error
          console.error(result);
          if (errorAlert) {
            const errorMsgEl = $('.error-msg', errorAlert);
            if (errorMsgEl && result.message) {
              errorMsgEl.textContent = result.message;
            }
            errorAlert.style.display = 'flex';
          }
        }
      })
      .catch((error) => {
        // Network error
        console.error(error);
        if (errorAlert) {
          const errorMsgEl = $('.error-msg', errorAlert);
          if (errorMsgEl) {
            errorMsgEl.textContent = 'Something went wrong. Please check your connection and try again.';
          }
          errorAlert.style.display = 'flex';
        }
      })
      .then(() => {
        // Restore button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
        }
      });
    });
  }

})();
