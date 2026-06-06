/* 烈哥客家面 — interactions */
(function () {
  'use strict';

  /* ---- sticky nav ---- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    // hero parallax
    if (heroBg) {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      }
    }
  }
  var heroBg = document.querySelector('.hero-bg');
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile drawer ---- */
  var menuBtn = document.querySelector('.menu-btn');
  var body = document.body;
  function closeMenu() { body.classList.remove('menu-open'); }
  menuBtn.addEventListener('click', function () { body.classList.toggle('menu-open'); });
  document.querySelectorAll('.drawer a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); closeLightbox(); }
  });

  /* ---- scroll reveal ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---- lightbox ---- */
  var figs = Array.prototype.slice.call(document.querySelectorAll('.gal-grid figure img'));
  var lb = document.querySelector('.lightbox');
  var lbImg = lb.querySelector('img');
  var idx = 0;
  function openLightbox(i) {
    idx = i; lbImg.src = figs[idx].src; lb.classList.add('open');
  }
  function closeLightbox() { lb.classList.remove('open'); }
  function step(d) { idx = (idx + d + figs.length) % figs.length; lbImg.src = figs[idx].src; }
  figs.forEach(function (im, i) { im.parentElement.addEventListener('click', function () { openLightbox(i); }); });
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  lb.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

  /* expose for esc */
  window.closeLightbox = closeLightbox;
})();
