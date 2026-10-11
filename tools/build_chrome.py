#!/usr/bin/env python3
"""Stamp the shared site header and footer into every page.

The header (menu) and footer live in partials/header.html and
partials/footer.html. After editing either one, run from the repo folder:

    python3 tools/build_chrome.py

Each page in public/ that loads components.js gets the partials written in
between <!-- site-header --> and <!-- site-footer --> markers, so the menu
and footer links are in the HTML itself, visible to crawlers that don't run
JavaScript. Running it again just refreshes what's between the markers.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")

H_START = "<!-- site-header: from partials/header.html, run tools/build_chrome.py -->"
H_END = "<!-- /site-header -->"
F_START = "<!-- site-footer: from partials/footer.html, run tools/build_chrome.py -->"
F_END = "<!-- /site-footer -->"


def read(name):
    with open(os.path.join(ROOT, "partials", name), encoding="utf-8") as f:
        return f.read().strip()


def stamp(html, start, end, block, anchor_re, after):
    region = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    stamped = f"{start}\n{block}\n{end}"
    if region.search(html):
        return region.sub(lambda m: stamped, html, count=1)
    m = anchor_re.search(html) if after else None
    if after:
        return html[: m.end()] + "\n" + stamped + html[m.end():]
    i = html.lower().rfind("</body>")
    return html[:i] + stamped + "\n" + html[i:]


def main():
    header, footer = read("header.html"), read("footer.html")
    body_re = re.compile(r"<body\b[^>]*>", re.I)
    changed = 0
    for root, _, files in os.walk(PUBLIC):
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            with open(path, encoding="utf-8") as f:
                html = f.read()
            if "components.js" not in html or not body_re.search(html):
                continue
            new = stamp(html, H_START, H_END, header, body_re, after=True)
            new = stamp(new, F_START, F_END, footer, body_re, after=False)
            if new != html:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new)
                changed += 1
    print(f"Updated {changed} pages")


if __name__ == "__main__":
    main()
