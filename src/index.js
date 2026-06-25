// Redirect the www hostname to the apex (non-www) so Google sees one
// canonical site, then serve the static assets for everything else.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.plentyofpetalspa.com") {
      url.hostname = "plentyofpetalspa.com";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
