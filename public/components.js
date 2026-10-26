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
