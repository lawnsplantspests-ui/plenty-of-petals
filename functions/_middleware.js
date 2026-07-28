// Visitor notifications for plentyofpetalspa.com
// Pages Function middleware: serves the site as normal, and pings
// Elyse's phone (via a Telegram bot) when a real person views a page.
// City/state comes from Cloudflare's built-in geolocation — no
// visitor data is stored anywhere.
// Telegram is used instead of ntfy because free ntfy.sh rate-limits by
// IP and blocks Cloudflare's shared egress IPs; Telegram does not.
// Credentials live in the TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID secrets.

// Skip search engines, crawlers, link previews, and monitoring tools
const BOT_RE = /bot|crawl|spider|slurp|bing|yandex|duckduck|baidu|facebookexternalhit|whatsapp|telegram|preview|curl|wget|python|java|go-http|headless|lighthouse|pingdom|uptime|monitor|scan|validator/i;

// Data-center / cloud / crawler networks. Visits from these come from
// servers, not people — automated crawlers that spoof a browser UA to
// dodge BOT_RE. Matched against Cloudflare's asOrganization (the
// visitor's network name). Residential ISPs (Comcast, Verizon, Spectrum,
// AT&T, T-Mobile, Frontier, etc.) never match these, so real local
// visitors are unaffected.
const HOSTING_RE = /google|amazon|\baws\b|microsoft|azure|digital\s?ocean|oracle|\bovh\b|hetzner|linode|akamai|fastly|cloudflare|facebook|meta platforms|censys|shodan|palo alto|leaseweb|contabo|vultr|scaleway|alibaba|tencent|huawei|datacamp|\bm247\b|choopa|quadranet|hostwinds|gcore|stackpath|sucuri|bytedance|internet archive|data\s?cent|colocat|hosting|\bcloud\b|\bvps\b|\bllc\b\s*host|\bservers?\b|\bseo\b|cogent|\bquay\b|\bpte\b|\bltd\b|\buab\b|\bidc\b|zenlayer|psychz|nforce|worldstream|constant company|dedicated|proxy|\bvpn\b|scraper|scraping|crawler/i;

// Real customers for a Central PA florist are in the US. Overseas
// "visitors" are scrapers/bots essentially 100% of the time.
const NOTIFY_COUNTRY = "US";

// Turn a URL path into a friendly page name, e.g.
// "/weddings" -> "Weddings page", "/" -> "Home page".
function friendlyPage(pathname) {
  if (!pathname || pathname === "/") return "Home page";
  const seg = pathname.replace(/\/+$/, "").replace(/\.html$/i, "").split("/").pop() || "home";
  const words = seg.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return words + " page";
}

// Rough device label from the User-Agent string.
function deviceType(ua) {
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) return /mobile/i.test(ua) ? "Android phone" : "Android tablet";
  if (/windows phone/i.test(ua)) return "Windows phone";
  if (/macintosh|mac os x/i.test(ua)) return "Mac";
  if (/windows nt/i.test(ua)) return "Windows PC";
  if (/cros/i.test(ua)) return "Chromebook";
  if (/linux/i.test(ua)) return "Linux computer";
  return "";
}

// Where the visitor came from, based on the Referer header. Empty
// referer (very common — direct visits, bookmarks, privacy browsers)
// reads as "Direct". A known platform is named; any other site shows
// its domain. selfHost is this site's own hostname (internal → "").
function trafficSource(request, selfHost) {
  const ref = request.headers.get("referer") || "";
  if (!ref) return "Direct / bookmark";
  let host = "";
  try {
    host = new URL(ref).hostname.replace(/^www\./i, "").toLowerCase();
  } catch (e) {
    return "a link";
  }
  if (!host || host === selfHost) return "";
  if (/(^|\.)google\./.test(host)) return "Google search";
  if (/(^|\.)bing\./.test(host)) return "Bing search";
  if (/duckduckgo/.test(host)) return "DuckDuckGo";
  if (/(^|\.)yahoo\./.test(host)) return "Yahoo search";
  if (/facebook\.|fb\.me|fb\.com|l\.facebook/.test(host)) return "Facebook";
  if (/instagram\./.test(host)) return "Instagram";
  if (/t\.co$|twitter\.|x\.com$/.test(host)) return "X/Twitter";
  if (/linkedin\.|lnkd\.in/.test(host)) return "LinkedIn";
  if (/youtube\.|youtu\.be/.test(host)) return "YouTube";
  if (/nextdoor\./.test(host)) return "Nextdoor";
  if (/yelp\./.test(host)) return "Yelp";
  if (/reddit\./.test(host)) return "Reddit";
  if (/tiktok\./.test(host)) return "TikTok";
  if (/pinterest\.|pin\.it/.test(host)) return "Pinterest";
  if (/theknot\./.test(host)) return "The Knot";
  if (/weddingwire\./.test(host)) return "WeddingWire";
  if (/(^|\.)g\.co$|maps\.google/.test(host)) return "Google Maps";
  return host;
}

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
      const org = (request.cf && request.cf.asOrganization) || "";
      const country = (request.cf && request.cf.country) || "";
      let reason = "queued";
      if (!userAgent || BOT_RE.test(userAgent)) reason = "bot";
      else if (org && HOSTING_RE.test(org)) reason = "datacenter";
      else if (country && country !== NOTIFY_COUNTRY) reason = "overseas";
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
      // Diagnostic: are the Telegram secrets present in this runtime?
      // "tc" = both, "t-" = token only, "-c" = chat only, "--" = none.
      const cfg =
        (context.env && context.env.TELEGRAM_BOT_TOKEN ? "t" : "-") +
        (context.env && context.env.TELEGRAM_CHAT_ID ? "c" : "-");
      tagged.headers.set("x-tg-config", cfg);
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
    const postal = country === "US" ? (cf.postalCode || "") : "";
    let place =
      country === "US"
        ? region
          ? `${city}, ${region}`
          : city
        : `${city}, ${country}`;
    if (postal) place += " " + postal;

    const pageName = friendlyPage(url.pathname);
    const device = deviceType(request.headers.get("user-agent") || "");
    const source = trafficSource(request, url.hostname);
    // Network/ISP name — shown so you can tell a real person (residential
    // ISP) from a bot that slipped through (a hosting company).
    const org = (cf.asOrganization || "").toString().trim();

    // Assemble a scannable multi-line message, skipping any blank parts.
    const lines = ["🌸 Plenty of Petals", `📍 ${place} · 📄 ${pageName}`];
    const meta = [];
    if (device) meta.push(`📱 ${device}`);
    if (source) meta.push(`↗️ ${source}`);
    if (meta.length) lines.push(meta.join(" · "));
    if (org) lines.push(`📡 ${org}`);

    // Send via the Telegram Bot API (reliable from Cloudflare's shared
    // egress IPs). Secrets: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
    const botToken = env && env.TELEGRAM_BOT_TOKEN ? String(env.TELEGRAM_BOT_TOKEN).trim() : "";
    const chatId = env && env.TELEGRAM_CHAT_ID ? String(env.TELEGRAM_CHAT_ID).trim() : "";
    if (!botToken || !chatId) return "no-config";
    const resp = await fetch(
      "https://api.telegram.org/bot" + botToken + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
        }),
      }
    );
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
