/* === Mosstop Theme JS — Premium === */

(function () {
  'use strict';

  /* --- Staggered Scroll Reveal --- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!els.length || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- Parallax Scroll Effect --- */
  function initParallax() {
    var els = document.querySelectorAll('.parallax');
    if (!els.length) return;
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrollY = window.scrollY;
          els.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            var speed = parseFloat(el.dataset.parallaxSpeed) || 0.15;
            var offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
            el.style.transform = 'translateY(' + offset + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Header: Transparent → Solid on Scroll --- */
  function initHeaderScroll() {
    var header = document.querySelector('[data-header]');
    if (!header) return;
    var isTransparent = header.classList.contains('header--transparent');
    var scrolled = false;

    function onScroll() {
      var shouldScroll = window.scrollY > 60;
      if (shouldScroll !== scrolled) {
        scrolled = shouldScroll;
        if (scrolled) {
          header.classList.add('header--scrolled');
          if (isTransparent) header.classList.remove('header--transparent');
        } else {
          header.classList.remove('header--scrolled');
          if (isTransparent) header.classList.add('header--transparent');
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile Menu --- */
  function initMobileMenu() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var close = document.getElementById('mobile-menu-close');
    var drawer = document.getElementById('mobile-menu-drawer');
    if (!toggle || !drawer) return;

    function open() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function shut() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer || e.target.classList.contains('mobile-drawer__overlay')) shut();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) shut();
    });
  }

  /* --- FAQ Accordion with Smooth Height --- */
  function initAccordion() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-accordion-trigger]');
      if (!trigger) return;

      var content = trigger.nextElementSibling;
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var faqItem = trigger.closest('.faq-item');

      if (expanded) {
        // Close: animate height to 0
        content.style.maxHeight = content.scrollHeight + 'px';
        requestAnimationFrame(function () {
          content.style.maxHeight = '0';
          content.style.paddingTop = '0';
          content.style.paddingBottom = '0';
        });
        setTimeout(function () {
          content.hidden = true;
          content.style.maxHeight = '';
          content.style.paddingTop = '';
          content.style.paddingBottom = '';
        }, 300);
        trigger.setAttribute('aria-expanded', 'false');
        if (faqItem) faqItem.classList.remove('is-active');
      } else {
        // Open: animate from 0 to scrollHeight
        content.hidden = false;
        content.style.maxHeight = '0';
        content.style.overflow = 'hidden';
        requestAnimationFrame(function () {
          content.style.maxHeight = content.scrollHeight + 'px';
        });
        setTimeout(function () {
          content.style.maxHeight = '';
          content.style.overflow = '';
        }, 300);
        trigger.setAttribute('aria-expanded', 'true');
        if (faqItem) faqItem.classList.add('is-active');
      }
    });
  }

  /* --- Scroll Progress Indicator --- */
  function initScrollProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function () {
          var docHeight = document.documentElement.scrollHeight - window.innerHeight;
          var progress = docHeight > 0 ? window.scrollY / docHeight : 0;
          bar.style.transform = 'scaleX(' + Math.min(progress, 1) + ')';
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Cart AJAX (badge count) --- */
  function updateCartCount() {
    fetch('/cart.js')
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var badges = document.querySelectorAll('[data-cart-count]');
        badges.forEach(function (el) {
          el.textContent = cart.item_count;
          el.hidden = cart.item_count === 0;
        });
      })
      .catch(function () {});
  }

  function addToCart(formEl) {
    var formData = new FormData(formEl);
    return fetch('/cart/add.js', {
      method: 'POST',
      body: formData,
    })
      .then(function (r) {
        if (!r.ok) throw new Error('Add to cart failed');
        return r.json();
      })
      .then(function (item) {
        updateCartCount();
        return item;
      });
  }

  function initAddToCartForms() {
    document.addEventListener('submit', function (e) {
      var form = e.target.closest('form[action="/cart/add"]');
      if (!form) return;
      e.preventDefault();
      var btn = form.querySelector('[type="submit"]');
      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '...';
      addToCart(form)
        .then(function () {
          btn.textContent = '\u2713';
          setTimeout(function () {
            btn.textContent = origText;
            btn.disabled = false;
          }, 1500);
        })
        .catch(function () {
          btn.textContent = origText;
          btn.disabled = false;
        });
    });
  }

  /* --- Quantity Selector --- */
  function initQuantitySelectors() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-qty-btn]');
      if (!btn) return;
      var wrap = btn.closest('[data-qty]');
      var input = wrap.querySelector('input');
      var val = parseInt(input.value, 10) || 1;
      var min = parseInt(input.min, 10) || 1;
      var max = parseInt(input.max, 10) || 99;
      if (btn.dataset.qtyBtn === 'minus') {
        input.value = Math.max(min, val - 1);
      } else {
        input.value = Math.min(max, val + 1);
      }
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  /* --- Cart line item update --- */
  function initCartUpdates() {
    document.addEventListener('change', function (e) {
      var input = e.target.closest('[data-cart-qty]');
      if (!input) return;
      var key = input.dataset.cartQty;
      var quantity = parseInt(input.value, 10);
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity }),
      })
        .then(function (r) { return r.json(); })
        .then(function () {
          window.location.reload();
        });
    });
  }

  /* --- Init --- */
  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initParallax();
    initHeaderScroll();
    initMobileMenu();
    initAccordion();
    initScrollProgress();
    initAddToCartForms();
    initQuantitySelectors();
    initCartUpdates();
    updateCartCount();
  });
})();
