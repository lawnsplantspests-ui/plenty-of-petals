// Analytics, favicon and current-page menu highlight for every page
// Usage: <script src="components.js"></script>

(function () {
  // Local previews (localhost) aren't real visitors — keep them out of the stats
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';

  // Google Analytics 4 (gtag.js) — injected on every page
  (function () {
    if (isLocal) return;
    var id = 'G-H0XHH6SBP1';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', id);
  })();

  // Count phone, text and email taps (and contact-form sends, via window.siteTrack)
  // as Google Analytics events, so visits can be tied to leads. Added 2026-11-11.
  window.siteTrack = function (name, params) {
    if (typeof window.gtag !== 'function') return;
    params = params || {};
    params.page_path = location.pathname;
    params.transport_type = 'beacon';
    window.gtag('event', name, params);
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href');
    var name = h.indexOf('tel:') === 0 ? 'phone_click' : h.indexOf('sms:') === 0 ? 'text_click' : h.indexOf('mailto:') === 0 ? 'email_click' : '';
    if (!name) return;
    var where = a.closest('.call-bar, .callbar') ? 'sticky bar' : a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : 'page';
    window.siteTrack(name, { link_location: where });
  }, true);

  // Add favicon globally
  document.head.insertAdjacentHTML('beforeend',
    '<link rel="icon" type="image/jpeg" href="/images/pop-logo-192.jpg">' +
    '<link rel="apple-touch-icon" href="/images/pop-logo-192.jpg">');

  // The header and footer are written into each page from partials/ by
  // tools/build_chrome.py. Here we only highlight the current page's menu link.
  const currentFile = '/' + (window.location.pathname.split('/').pop() || 'index.html');

  function markActive() {
    document.querySelectorAll('a[data-nav]').forEach(function (a) {
      if (a.getAttribute('href') === currentFile) a.classList.add('active');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markActive);
  } else {
    markActive();
  }
})();
