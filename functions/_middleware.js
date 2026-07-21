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
      if (reason === "queued") {
        if (url.searchParams.has("pingtest")) {
          // Test mode: send synchronously, skip dedupe, report outcome
          reason = await notifyVisit(request, url, context.env, true);
        } else {
          context.waitUntil(notifyVisit(request, url, context.env, false));
        }
      }

      // Debug header (visible in browser dev tools / curl -I):
      // says whether this page view queued a ping and why not if not
      const tagged = new Response(response.body, response);
      tagged.headers.set("x-visit-ping", reason);
      // Diagnostic: does the secret actually reach this runtime?
      // Reports length only, never the token value.
      const tl =
        context.env && context.env.NTFY_TOKEN
          ? String(context.env.NTFY_TOKEN).trim().length
          : 0;
      tagged.headers.set("x-ntfy-token-len", String(tl));
      return tagged;
    }
  } catch (e) {
    // Notification problems must never affect serving the site
  }

  return response;
}

// Returns an outcome string (also used as the x-visit-ping header in
// test mode): "sent" | "deduped" | "send-failed-<status>" | "error-..."
async function notifyVisit(request, url, env, isTest) {
  // Dedupe: one notification per visitor per 30 minutes, so a person
  // browsing several pages doesn't fire a ping for every click.
  // If the cache misbehaves, send anyway rather than staying silent.
  const cache = caches.default;
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const dedupeKey = new Request(
    "https://visit-dedupe.pop-internal.example/" + encodeURIComponent(ip)
  );
  if (!isTest) {
    try {
      if (await cache.match(dedupeKey)) return "deduped";
    } catch (e) {
      // fall through and send
    }
  }

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

    // Authenticate with the family ntfy account (stored as a Cloudflare
    // secret) so rate limits apply per-account, not per shared
    // Cloudflare egress IP — unauthenticated sends mostly 429
    const headers = {
      Title: "Plenty of Petals site visitor",
      Tags: "cherry_blossom",
    };
    const token = env && env.NTFY_TOKEN ? String(env.NTFY_TOKEN).trim() : "";
    if (token) {
      headers.Authorization = "Bearer " + token;
    }
    const resp = await fetch("https://ntfy.sh/" + NTFY_TOPIC, {
      method: "POST",
      headers,
      body: `Someone from ${place} is viewing the site (${page})`,
    });
    if (!resp.ok) return "send-failed-" + resp.status;

    // Only start the 30-min quiet window after a successful send,
    // so a failed send doesn't silence the next real visit
    if (!isTest) {
      try {
        await cache.put(
          dedupeKey,
          new Response("1", { headers: { "Cache-Control": "max-age=1800" } })
        );
      } catch (e) {}
    }
    return "sent";
  } catch (e) {
    const msg = e && e.message ? String(e.message) : "unknown";
    return "error-" + msg.replace(/[^\x20-\x7E]/g, "").slice(0, 60);
  }
}
