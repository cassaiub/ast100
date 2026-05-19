/* AST 100 — Our Cosmic History
   Vanilla JS for navbar, dropdowns, parallax, lightbox, reveal-on-scroll.
*/

(function () {
  'use strict';

  // ----- Navbar scroll -----
  const navbar = document.querySelector('.navbar');
  function onScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Hamburger menu (mobile) -----
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      const expanded = navLinks.classList.contains('open');
      hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });
  }

  // ----- Dropdown toggles (click on mobile, hover on desktop via CSS) -----
  document.querySelectorAll('.nav-toggle-link').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      // On mobile, toggle dropdown explicitly
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const dropdown = btn.parentElement.querySelector('.nav-dropdown');
        if (dropdown) {
          // Close other open dropdowns
          document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
            if (d !== dropdown) d.classList.remove('open');
          });
          dropdown.classList.toggle('open');
        }
      }
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!navbar) return;
    if (!navbar.contains(e.target) && navLinks && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
        d.classList.remove('open');
      });
    }
  });

  // ----- Parallax on hero background -----
  const heroBgs = document.querySelectorAll('.hero-bg');
  function onParallax() {
    heroBgs.forEach(function (bg) {
      const rect = bg.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const speed = 0.35;
      const offset = -rect.top * speed;
      bg.style.transform = 'translate3d(0,' + offset + 'px,0)';
    });
  }
  if (heroBgs.length) {
    window.addEventListener('scroll', onParallax, { passive: true });
    onParallax();
  }

  // ----- Reveal on scroll via IntersectionObserver -----
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ----- Lightbox for all content figures -----
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<img class="lightbox-img" alt="">';
    document.body.appendChild(lightbox);
  }
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  // Bind images. Skip background images and explicit no-lightbox class.
  document.querySelectorAll('.content img, .figure img, figure img').forEach(function (img) {
    if (img.dataset.nolightbox === 'true') return;
    img.addEventListener('click', function () {
      openLightbox(img.currentSrc || img.src, img.alt);
    });
  });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === lightboxImg || e.target === lightboxClose) {
      closeLightbox();
    }
  });
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  // ----- Smooth scroll-down arrow -----
  document.querySelectorAll('.scroll-indicator').forEach(function (arrow) {
    arrow.style.cursor = 'pointer';
    arrow.addEventListener('click', function () {
      const hero = arrow.closest('.hero');
      const next = hero && hero.nextElementSibling;
      if (next) {
        next.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
