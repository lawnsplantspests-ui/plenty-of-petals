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
