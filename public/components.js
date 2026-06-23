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
'<a href="https://www.facebook.com/PlentyofPetalsPA/" target="_blank" rel="noopener">Facebook</a>\n' +
'<a href="https://www.instagram.com/plenty.of.petals" target="_blank" rel="noopener">Instagram</a>\n' +
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
