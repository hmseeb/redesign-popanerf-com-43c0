/* Pop-A-Nerf Entertainment — site interactions */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open && window.innerWidth <= 960 ? 'hidden' : '';
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) closeNav();
    });
  }

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-stuck', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function show(el) {
    el.classList.add('is-visible');
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });

    /* Safety net: fast or programmatic scrolling can outrun the observer. */
    var ticking = false;
    var sweep = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var limit = window.innerHeight * 0.98;
        revealables.forEach(function (el) {
          if (el.classList.contains('is-visible')) return;
          if (el.getBoundingClientRect().top < limit) {
            show(el);
            io.unobserve(el);
          }
        });
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);
    window.addEventListener('load', sweep);
    sweep();
  } else {
    revealables.forEach(show);
  }

  /* ---------- Active section highlighting ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__list a[href^="#"]'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Event estimator ---------- */
  var groupSize = document.getElementById('groupSize');
  var totalEl = document.getElementById('estimateTotal');
  var hintEl = document.getElementById('estimateHint');
  var estimator = document.getElementById('estimator');

  if (groupSize && totalEl && estimator) {
    var checkboxes = Array.prototype.slice.call(estimator.querySelectorAll('.opt input[type="checkbox"]'));
    var quantities = Array.prototype.slice.call(estimator.querySelectorAll('.qty input[type="number"]'));
    var chairsInput = document.getElementById('qtyChairs');

    var money = function (value) {
      return '$' + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    function update() {
      var base = parseFloat(groupSize.value) || 0;
      var addOns = 0;
      var count = 0;

      checkboxes.forEach(function (box) {
        if (box.checked) {
          addOns += parseFloat(box.dataset.price) || 0;
          count++;
        }
      });

      quantities.forEach(function (input) {
        var qty = parseInt(input.value, 10);
        if (isNaN(qty) || qty < 0) qty = 0;
        if (qty > 0) {
          addOns += qty * (parseFloat(input.dataset.price) || 0);
          count++;
        }
      });

      var chairQty = chairsInput ? parseInt(chairsInput.value, 10) : 0;
      var chairWarning = !isNaN(chairQty) && chairQty > 0 && chairQty < 4;

      if (base === 0) {
        totalEl.textContent = 'Call for pricing';
        hintEl.textContent = chairWarning
          ? 'Groups of 36 or more require special pricing. Folding chairs have a 4-chair minimum.'
          : 'Groups of 36 or more require special pricing — call 786-671-NERF (6373)' +
            (addOns > 0 ? '. Selected upgrades add ' + money(addOns) + '.' : '.');
        return;
      }

      totalEl.textContent = money(base + addOns);

      if (chairWarning) {
        hintEl.textContent = 'Folding chairs have a 4-chair minimum — please add at least 4.';
      } else if (count === 0) {
        hintEl.textContent = 'Standard event package: 2 hours hosted, arena, blasters, darts, eyewear and referee.';
      } else {
        hintEl.textContent = money(base) + ' base package + ' + money(addOns) + ' in upgrades (' +
          count + ' selected).';
      }
    }

    groupSize.addEventListener('change', update);
    checkboxes.forEach(function (box) { box.addEventListener('change', update); });
    quantities.forEach(function (input) {
      input.addEventListener('input', update);
      input.addEventListener('change', function () {
        var qty = parseInt(input.value, 10);
        if (isNaN(qty) || qty < 0) input.value = 0;
        update();
      });
    });

    update();
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
