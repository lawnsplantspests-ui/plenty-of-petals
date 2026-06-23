// Shared nav + footer injected on every page
// Usage: <script src="components.js"></script>

(function () {
  const NAV_LINKS = [
    { href: 'weddings.html',           label: 'Weddings' },
    { href: 'events.html',             label: 'Events' },
    { href: 'diy-wedding-flowers.html',label: 'DIY Flowers' },
    { href: 'gallery.html',            label: 'Gallery' },
    { href: 'articles.html',           label: 'Planning' },
    { href: 'contact.html',            label: 'Contact' },
  ];

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  const navHtml = NAV_LINKS.map(function (l) {
    var active = currentFile === l.href ? ' class="active"' : '';
    return '<a href="' + l.href + '"' + active + '>' + l.label + '</a>';
  }).join('\n');

  const header = '<header class="site"><div class="nav">\n' +
    '<a href="index.html" class="brand">Plenty of Petals<small>Wedding &amp; Event Florist &middot; Harrisburg, PA</small></a>\n' +
    '<button class="menutoggle" aria-label="Menu" onclick="document.getElementById(\'nav\').classList.toggle(\'open\')">&#9776;</button>\n' +
    '<nav class="navlinks" id="nav">\n' + navHtml + '\n' +
    '<a href="tel:7176081401" class="callbtn">Call 717-608-1401</a>\n' +
    '</nav>\n</div></header>';

  const footer =
'<footer class="site">\n' +
'<div class="wrap">\n' +
'<div class="fgrid">\n' +
'<div>\n' +
'<div class="fbrand">Plenty of Petals</div>\n' +
'<p style="margin-top:14px;color:rgba(255,255,255,.7);max-width:34ch;line-height:1.65">Custom, appointment-only wedding &amp; event florist in Harrisburg, PA. Designed around you. Built around your budget.</p>\n' +
'<p style="margin-top:18px;color:rgba(255,255,255,.7);line-height:1.7">3502 High St.<br>Harrisburg, PA 17109</p>\n' +
'<p style="margin-top:12px"><a href="tel:7176081401" style="color:var(--blush);font-weight:600;display:inline;font-size:.95rem">717-608-1401</a><br><a href="mailto:plentyofpetals@hotmail.com" style="color:rgba(255,255,255,.75);display:inline;font-size:.86rem">plentyofpetals@hotmail.com</a></p>\n' +
'</div>\n' +
'<div>\n' +
'<h4>Services</h4>\n' +
'<a href="weddings.html">Wedding Flowers</a>\n' +
'<a href="events.html">Event Florals</a>\n' +
'<a href="diy-wedding-flowers.html">DIY Wedding Flowers</a>\n' +
'<a href="gallery.html">Gallery</a>\n' +
'</div>\n' +
'<div>\n' +
'<h4>Planning</h4>\n' +
'<a href="articles.html">Planning Articles</a>\n' +
'<a href="contact.html">Book a Consultation</a>\n' +
'<a href="contact.html">Contact</a>\n' +
'<a href="privacy.html">Privacy</a>\n' +
'</div>\n' +
'<div>\n' +
'<h4>Follow &amp; reviews</h4>\n' +
'<div class="social-icons">\n' +
'<a href="https://www.facebook.com/PlentyofPetalsPA/" class="social-icon social-fb" aria-label="Plenty of Petals on Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.19 2.24.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z"/></svg></a>\n' +
'<a href="https://www.instagram.com/plenty.of.petals" class="social-icon social-ig" aria-label="Plenty of Petals on Instagram" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.43-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38-.66.67-1.07 1.34-1.38 2.13-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12c0 3.26.01 3.67.07 4.95.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13-.67-.66-1.34-1.07-2.13-1.38-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 1 0 2.88 1.44 1.44 0 0 1 0-2.88z"/></svg></a>\n' +
'</div>\n' +
'<a href="https://www.weddingwire.com/biz/plenty-of-petals-middletown/0bc2f4255997d24f.html" target="_blank" rel="noopener">WeddingWire</a>\n' +
'<a href="https://www.allemanapiary.com" target="_blank" rel="noopener">The Alleman Apiary</a>\n' +
'<a href="https://www.lawnsplantspests.com" target="_blank" rel="noopener">Lawns Plants &amp; Pests</a>\n' +
'</div>\n' +
'</div>\n' +
'<div class="fnote">\n' +
'<span>&copy;2026 Plenty of Petals &middot; Harrisburg, PA</span>\n' +
'<span>By appointment only &middot; 717-608-1401</span>\n' +
'</div>\n' +
'</div>\n' +
'</footer>';

  function injectChrome() {
    document.body.insertAdjacentHTML('afterbegin', header);
    document.body.insertAdjacentHTML('beforeend', footer);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChrome);
  } else {
    injectChrome();
  }
})();
