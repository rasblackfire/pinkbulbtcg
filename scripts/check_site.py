#!/usr/bin/env python3
"""Controleer lokale links, afbeeldingen en JSON-data zonder externe netwerkverzoeken."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", ".github", "node_modules", "vendor", "drafts", "_drafts", "templates"}
DATA_FILES = {
    "data/news.json": ("title", "url", "date"),
    "data/releases.json": ("title", "date"),
    "data/events.json": ("title", "date"),
    "data/posts.json": ("title",),
}
class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"a", "link"} and attrs.get("href"):
            self.refs.append((tag, attrs["href"]))
        if tag in {"img", "script", "source"} and attrs.get("src"):
            self.refs.append((tag, attrs["src"]))

def local_target(page, url):
    url = url.strip()
    if not url or url.startswith(("#", "//", "data:", "mailto:", "tel:", "javascript:")):
        return None
    parts = urlsplit(url)
    if parts.scheme or parts.netloc:
        return None
    path = unquote(parts.path)
    if not path:
        return None
    target = (ROOT / path.lstrip("/")) if path.startswith("/") else (page.parent / path)
    target = target.resolve()
    if not target.is_relative_to(ROOT.resolve()):
        return None
    if target.is_dir():
        target /= "index.html"
    return target

warnings = []
for path in sorted(ROOT.rglob("*.html")):
    if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
        continue
    parser = References()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    for tag, url in parser.refs:
        target = local_target(path, url)
        if target is not None and not target.is_file():
            warnings.append(f"{path.relative_to(ROOT)}: ontbrekend bestand ({tag}) {url}")

for name, required in DATA_FILES.items():
    path = ROOT / name
    if not path.exists():
        warnings.append(f"{name}: bestand ontbreekt")
        continue
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError("verwacht een lijst")
        for index, item in enumerate(data, 1):
            if not isinstance(item, dict):
                warnings.append(f"{name} item {index}: verwacht een object")
                continue
            for key in required:
                if not item.get(key):
                    warnings.append(f"{name} item {index}: veld '{key}' ontbreekt")
            if name == "data/posts.json" and item.get("published") is not False and not item.get("voorbeeld"):
                section, slug = item.get("section"), item.get("id")
                if section in {"blog", "tips"} and isinstance(slug, str) and slug:
                    article = ROOT / section / (slug + ".html")
                    if not article.is_file():
                        warnings.append(f"{name} item {index}: artikelpagina ontbreekt: {section}/{slug}.html")
            if name == "data/news.json" and item.get("url"):
                target = local_target(ROOT / "index.html", item["url"])
                if target is not None and not target.is_file():
                    warnings.append(f"{name} item {index}: artikel bestaat niet: {item['url']}")
            if name == "data/news.json" and item.get("image"):
                target = local_target(ROOT / "index.html", item["image"])
                if target is not None and not target.is_file():
                    warnings.append(f"{name} item {index}: afbeelding bestaat niet: {item['image']}")
    except (ValueError, json.JSONDecodeError) as exc:
        warnings.append(f"{name}: ongeldig JSON-formaat: {exc}")

print(f"Websitecontrole: {len(warnings)} aandachtspunten")
for warning in warnings:
    print("WARNING:", warning)
# Bestaande pagina's kunnen oude links bevatten: informatief, niet blokkeren.
