#!/usr/bin/env python3
"""Fetch basic public metadata for a curated list of Marktplaats ad URLs.

This is best-effort: Marktplaats may change its markup or block automated requests.
"""
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "data" / "marktplaats-links.json"
OUTPUT = ROOT / "data" / "marktplaats-data.json"

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.title_parts = []
        self.in_title = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag.lower() == "meta":
            key = (attrs.get("property") or attrs.get("name") or "").lower()
            value = attrs.get("content")
            if key and value:
                self.meta[key] = value.strip()
        elif tag.lower() == "title":
            self.in_title = True
    def handle_endtag(self, tag):
        if tag.lower() == "title":
            self.in_title = False
    def handle_data(self, data):
        if self.in_title:
            self.title_parts.append(data.strip())

def clean(value):
    if not value:
        return ""
    value = re.sub(r"\s+", " ", value).strip()
    value = re.sub(r"\s*[|–-]\s*Marktplaats.*$", "", value, flags=re.I)
    return value

def fetch(url):
    req = Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; PinkBulbTCG/1.0; +https://pinkbulbtcg.nl)",
        "Accept": "text/html,application/xhtml+xml"
    })
    with urlopen(req, timeout=20) as response:
        final_url = response.geturl()
        html = response.read(3_000_000).decode("utf-8", errors="replace")
        return response.status, final_url, html

def main():
    links = json.loads(INPUT.read_text(encoding="utf-8"))
    results = []
    for original in links:
        if not isinstance(original, str) or not original.startswith("https://"):
            continue
        item = {"url": original, "status": "unknown", "title": "", "price": "", "image": ""}
        try:
            code, final_url, html = fetch(original)
            parser = MetaParser(); parser.feed(html)
            meta = parser.meta
            title = clean(meta.get("og:title") or meta.get("twitter:title") or " ".join(parser.title_parts))
            image = meta.get("og:image") or meta.get("twitter:image") or ""
            # Price metadata is not consistently exposed by Marktplaats. Try common tags and JSON text.
            price = meta.get("product:price:amount") or meta.get("og:price:amount") or ""
            if not price:
                match = re.search(r'"(?:price|askingPrice)"\s*:\s*"?(\d+(?:[.,]\d{1,2})?)', html, re.I)
                if match:
                    price = match.group(1).replace(".", ",")
            unavailable_text = re.search(r"advertentie\s+(is\s+)?(verwijderd|niet meer beschikbaar|niet gevonden)|deze advertentie bestaat niet", html, re.I)
            if code in (404, 410) or unavailable_text:
                item["status"] = "unavailable"
            elif title and "marktplaats" not in title.lower() and not title.lower().startswith("pagina niet gevonden"):
                item["status"] = "active"
                item["title"] = title
                item["price"] = ("€ " + price.replace(".", ",")) if price and not price.startswith("€") else price
                item["image"] = image
                item["url"] = final_url or original
            else:
                # Do not falsely claim sold when the site blocks the scraper or changes its page.
                item["status"] = "unknown"
        except HTTPError as exc:
            item["status"] = "unavailable" if exc.code in (404, 410) else "unknown"
        except (URLError, TimeoutError, Exception):
            item["status"] = "unknown"
        results.append(item)
        time.sleep(2)
    OUTPUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(results)} Marktplaats entries to {OUTPUT}")

if __name__ == "__main__":
    main()
