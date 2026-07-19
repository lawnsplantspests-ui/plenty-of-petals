// Visitor notifications for plentyofpetalspa.com
// Pages Function middleware: serves the site as normal, and pings
// Elyse's phone (via ntfy.sh) when a real person views a page.
// City/state comes from Cloudflare's built-in geolocation — no
// visitor data is stored anywhere.

const NTFY_TOPIC = "pop-visits-5hwjbgnl8r";

// Skip search engines, crawlers, link previews, and monitoring tools
const BOT_RE = /bot|crawl|spider|slurp|bing|yandex|duckduck|baidu|facebookexternalhit|whatsapp|telegram|preview|curl|wget|python|java|go-http|headless|lighthouse|pingdom|uptime|monitor|scan|validator/i;

export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);

  // One-time link Devon & Elyse open on their own devices so their
  // visits don't ping the phone
  if (url.pathname === "/im-family") {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie":
          "pop_owner=1; Max-Age=31536000; Path=/; Secure; HttpOnly; SameSite=Lax",
      },
    });
  }

  const response = await context.next();

  try {
    const contentType = response.headers.get("content-type") || "";
    if (
      request.method === "GET" &&
      response.status === 200 &&
      contentType.includes("text/html")
    ) {
      const userAgent = request.headers.get("user-agent") || "";
      const cookies = request.headers.get("cookie") || "";
      let reason = "queued";
      if (!userAgent || BOT_RE.test(userAgent)) reason = "bot";
      else if (cookies.includes("pop_owner=1")) reason = "owner";

      // NOTE: call waitUntil on context — destructuring it detaches
      // the method from its object and it silently fails
      if (reason === "queued") context.waitUntil(notifyVisit(request, url));

      // Debug header (visible in browser dev tools / curl -I):
      // says whether this page view queued a ping and why not if not
      const tagged = new Response(response.body, response);
      tagged.headers.set("x-visit-ping", reason);
      return tagged;
    }
  } catch (e) {
    // Notification problems must never affect serving the site
  }

  return response;
}

async function notifyVisit(request, url) {
  // Dedupe: one notification per visitor per 30 minutes, so a person
  // browsing several pages doesn't fire a ping for every click.
  // If the cache misbehaves, send anyway rather than staying silent.
  let alreadyPinged = false;
  try {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const cache = caches.default;
    const dedupeKey = new Request(
      "https://visit-dedupe.pop-internal.example/" + encodeURIComponent(ip)
    );
    if (await cache.match(dedupeKey)) {
      alreadyPinged = true;
    } else {
      await cache.put(
        dedupeKey,
        new Response("1", { headers: { "Cache-Control": "max-age=1800" } })
      );
    }
  } catch (e) {
    // fall through and send
  }
  if (alreadyPinged) return;

  try {
    const cf = request.cf || {};
    const city = cf.city || "Somewhere";
    const region = cf.regionCode || cf.region || "";
    const country = cf.country || "";
    const place =
      country === "US"
        ? region
          ? `${city}, ${region}`
          : city
        : `${city}, ${country}`;
    const page = url.pathname === "/" ? "home page" : url.pathname;

    await fetch("https://ntfy.sh/" + NTFY_TOPIC, {
      method: "POST",
      headers: {
        Title: "Plenty of Petals site visitor",
        Tags: "cherry_blossom",
      },
      body: `Someone from ${place} is viewing the site (${page})`,
    });
  } catch (e) {
    // Never let a failed ping break anything
  }
}
