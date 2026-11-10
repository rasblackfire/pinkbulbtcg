#!/usr/bin/env python3
"""Haal openbare gegevens op voor de Marktplaats-links in data/marktplaats-links.json.

Dit is 'best effort': Marktplaats kan automatische verzoeken blokkeren of de
opmaak van de pagina wijzigen. Daarom geldt:
- Lukt het ophalen niet, dan blijven eerder opgehaalde gegevens staan.
- Alleen een duidelijke 404/410 of verwijdermelding telt als 'unavailable'.
- Titel, prijs en foto die je zelf in de links-lijst invult, tonen op de site
  altijd voorrang boven wat dit script ophaalt (zie README).
"""
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError
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
    return re.sub(r"\s*[|–-]\s*Marktplaats.*$", "", value, flags=re.I)


def fetch(url):
    req = Request(url, headers={
        "User-Agent": "Mozilla/5.0 (compatible; PinkBulbTCG/1.0; +https://pinkbulbtcg.nl)",
        "Accept": "text/html,application/xhtml+xml",
    })
    with urlopen(req, timeout=20) as response:
        html = response.read(3_000_000).decode("utf-8", errors="replace")
        return response.status, html


def read_json(path, default):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def load_links():
    """Links mogen een kale tekst zijn of een object met een 'url'-veld."""
    links = []
    for entry in read_json(INPUT, []):
        url = entry if isinstance(entry, str) else (entry or {}).get("url", "")
        if isinstance(url, str) and url.strip().startswith("https://"):
            links.append(url.strip())
    return links


def scrape(url):
    item = {"url": url, "status": "unknown", "title": "", "price": "", "image": ""}
    try:
        code, html = fetch(url)
    except HTTPError as exc:
        if exc.code in (404, 410):
            item["status"] = "unavailable"
        return item
    except Exception:
        return item

    parser = MetaParser()
    parser.feed(html)
    meta = parser.meta
    title = clean(meta.get("og:title") or meta.get("twitter:title") or " ".join(parser.title_parts))
    image = meta.get("og:image") or meta.get("twitter:image") or ""
    price = meta.get("product:price:amount") or meta.get("og:price:amount") or ""
    if not price:
        match = re.search(r'"(?:price|askingPrice)"\s*:\s*"?(\d+(?:[.,]\d{1,2})?)', html, re.I)
        if match:
            price = match.group(1).replace(".", ",")

    gone = re.search(
        r"advertentie\s+(is\s+)?(verwijderd|niet meer beschikbaar|niet gevonden)|deze advertentie bestaat niet",
        html, re.I)
    if code in (404, 410) or gone:
        item["status"] = "unavailable"
    elif title and "marktplaats" not in title.lower() and not title.lower().startswith("pagina niet gevonden"):
        item["status"] = "active"
        item["title"] = title
        item["price"] = ("€ " + price.replace(".", ",")) if price and not price.startswith("€") else price
        item["image"] = image
    return item


def main():
    previous = {i.get("url"): i for i in read_json(OUTPUT, []) if isinstance(i, dict)}
    results = []
    for url in load_links():
        item = scrape(url)
        old = previous.get(url)
        # Blokkade of netwerkfout: houd de laatst bekende goede gegevens vast.
        if item["status"] == "unknown" and old and old.get("status") in ("active", "unavailable"):
            item = old
        results.append(item)
        time.sleep(2)
    OUTPUT.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ok = sum(1 for r in results if r["status"] == "active")
    print(f"{len(results)} advertenties verwerkt, {ok} met gegevens. Geschreven naar {OUTPUT}")


if __name__ == "__main__":
    main()
