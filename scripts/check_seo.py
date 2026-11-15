#!/usr/bin/env python3
"""Check basic SEO metadata on public HTML pages; report warnings without blocking deployment."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import sys

ROOT=Path(__file__).resolve().parents[1]
SKIP={"404.html"}
SKIP_DIRS={".git",".github","node_modules","vendor","drafts","_drafts","templates"}
class HeadParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.head=False; self.title=False; self.titles=[]; self.metas=[]; self.links=[]; self.h1=0; self.images=[]
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if tag=="head":self.head=True
        if tag=="title" and self.head:self.title=True
        if tag=="meta" and self.head:self.metas.append(d)
        if tag=="link" and self.head:self.links.append(d)
        if tag=="h1":self.h1+=1
        if tag=="img":self.images.append(d)
    def handle_endtag(self,tag):
        if tag=="title":self.title=False
        if tag=="head":self.head=False
    def handle_data(self,data):
        if self.title:self.titles.append(data)

warnings=[]
pages=0
for f in sorted(ROOT.rglob("*.html")):
    rel=f.relative_to(ROOT)
    if f.name in SKIP or any(x in SKIP_DIRS or x.startswith(".") for x in rel.parts):continue
    pages+=1
    p=HeadParser();p.feed(f.read_text(encoding="utf-8",errors="replace"))
    issues=[]
    title=" ".join(p.titles).strip()
    if not title:issues.append("missing title")
    if not any(m.get("name","").lower()=="description" and m.get("content","").strip() for m in p.metas):issues.append("missing meta description")
    canonical=[l.get("href","") for l in p.links if l.get("rel","").lower()=="canonical"]
    expected="https://pinkbulbtcg.nl/"+("" if rel.as_posix()=="index.html" else rel.as_posix())
    if not canonical:issues.append("missing canonical")
    elif canonical[0]!=expected:issues.append("canonical differs from expected URL")
    if p.h1!=1:issues.append(f"{p.h1} H1 headings (expected 1)")
    missing_alt=sum("alt" not in im for im in p.images)
    if missing_alt:issues.append(f"{missing_alt} images without alt attribute")
    if issues:warnings.append((str(rel),issues))
print(f"SEO check: {pages} pages, {len(warnings)} pages with warnings")
for path,issues in warnings:print(f"WARNING {path}: "+", ".join(issues))
# Informational only: never block publishing because of legacy content.
