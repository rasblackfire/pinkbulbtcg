#!/usr/bin/env python3
"""Generate new simple blog/tip pages from opted-in data/posts.json entries.

Existing hand-crafted pages are NEVER overwritten. Set "generatePage": true
on a post to opt in. All HTML is escaped; article bodies are plain paragraphs.
"""
from pathlib import Path
from html import escape
from datetime import date
import json
import re

ROOT = Path(__file__).resolve().parents[1]
POSTS = ROOT / "data/posts.json"
TEMPLATE = (ROOT / "templates/article.html").read_text(encoding="utf-8")
posts = json.loads(POSTS.read_text(encoding="utf-8"))
if not isinstance(posts, list):
    raise ValueError("data/posts.json must contain a list")
created = 0
for post in posts:
    if not isinstance(post, dict) or post.get("generatePage") is not True:
        continue
    if post.get("published") is False:
        continue
    section, slug = post.get("section"), post.get("id")
    if section not in ("blog", "tips") or not isinstance(slug, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError(f"Invalid article section/id: {section}/{slug}")
    path = ROOT / section / f"{slug}.html"
    if path.exists():
        print(f"Keeping existing article: {path.relative_to(ROOT)}")
        continue
    title = str(post.get("title") or "").strip()
    if not title:
        raise ValueError(f"Missing title: {section}/{slug}")
    summary = str(post.get("excerpt") or title).strip()
    tag = str(post.get("tag") or post.get("categorie") or "Artikel")
    published = str(post.get("date") or "")
    if published:
        date.fromisoformat(published)
    paragraphs = post.get("body", [])
    if not isinstance(paragraphs, list):
        raise ValueError(f"Body must be a list: {section}/{slug}")
    body = "\n".join(f"<p>{escape(str(p))}</p>" for p in paragraphs if str(p).strip())
    image = post.get("image")
    if image:
        if not isinstance(image, str) or not re.fullmatch(r"assets/[a-zA-Z0-9_./-]+", image) or ".." in image.split("/"):
            raise ValueError(f"Invalid image path: {section}/{slug}")
        body = f'<figure><img src="../{escape(image, quote=True)}" alt="{escape(title, quote=True)}" loading="lazy" decoding="async"></figure>\n' + body
    url = f"https://pinkbulbtcg.nl/{section}/{slug}.html"
    page = TEMPLATE
    for key, value in {
        "TITLE": escape(title),
        "DESCRIPTION": escape(summary, quote=True),
        "URL": escape(url, quote=True),
        "CATEGORY": escape(tag),
        "DATE": escape(published),
        "CONTENT": body,
        "BACK_URL": "../blog.html" if section == "blog" else "../tips.html",
        "BACK_LABEL": "Alle blogs" if section == "blog" else "Alle tips & tricks",
    }.items():
        page = page.replace("{{" + key + "}}", value)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(page, encoding="utf-8")
    print(f"Created {path.relative_to(ROOT)}")
    created += 1
print(f"Generated {created} new articles")
