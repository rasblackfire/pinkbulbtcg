#!/usr/bin/env python3
"""Build a sitemap of public HTML pages for the GitHub Pages site."""
from pathlib import Path
from urllib.parse import quote
from xml.etree.ElementTree import Element, SubElement, ElementTree, indent
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://pinkbulbtcg.nl/"
EXCLUDED_DIRS = {".git", ".github", "node_modules", "vendor", "templates", "drafts", "_drafts"}
EXCLUDED_FILES = {"404.html"}
entries = []
for page in ROOT.rglob("*.html"):
    relative = page.relative_to(ROOT)
    if any(part in EXCLUDED_DIRS or part.startswith(".") for part in relative.parts):
        continue
    if page.name.lower() in EXCLUDED_FILES:
        continue
    html = page.read_text(encoding="utf-8", errors="replace")
    if re.search(r'<meta\s+[^>]*name\s*=\s*["\']robots["\'][^>]*content\s*=\s*["\'][^"\']*noindex', html, re.I):
        continue
    if re.search(r'<meta\s+[^>]*content\s*=\s*["\'][^"\']*noindex[^"\']*["\'][^>]*name\s*=\s*["\']robots', html, re.I):
        continue
    url = BASE if relative.as_posix() == "index.html" else BASE + quote(relative.as_posix(), safe="/-._~")
    entries.append(url)

ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
root = Element("urlset", xmlns=ns)
for url in sorted(set(entries), key=lambda u: (u != BASE, u)):
    SubElement(SubElement(root, "url"), "loc").text = url
indent(root, space="  ")
tree = ElementTree(root)
tree.write(ROOT / "sitemap.xml", encoding="utf-8", xml_declaration=True)
print(f"Generated sitemap.xml with {len(set(entries))} URLs")
