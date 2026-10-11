# Plenty of Petals — Wedding & Event Florist Site

Custom appointment-only wedding florist studio in Harrisburg, PA, run by
Devon and Elyse Alleman. Sister business to The Alleman Apiary and
Lawns Plants & Pests LLC.

## Stack

Plain static HTML/CSS, no build step. Deploys as a Cloudflare Worker
with static assets pointed at `./public`. Mirrors the LPP and Apiary
setups; push to `main` auto-redeploys.

## Layout

- `public/` — served files (HTML, CSS, images, robots, sitemap)
- `public/articles/` — wedding-flower planning articles
- `public/images/` — photos (add later)
- `wrangler.jsonc` — `name: "petals"` → matches `petals.lawnsplantspests.workers.dev`

## Local preview

Open `public/index.html` in a browser. No build needed.

## Deploy

Push to `main` on the configured GitHub repo. Cloudflare picks it up.

## Menu and footer

The site menu and footer are written into every page, so search engines and
AI crawlers see the links without running JavaScript. Edit them in
`partials/header.html` and `partials/footer.html`, then run:

    python3 tools/build_chrome.py

That refreshes the copy in each page (between the `site-header` / `site-footer`
markers). `public/components.js` now only loads analytics, the favicon, and
highlights the current page in the menu.
