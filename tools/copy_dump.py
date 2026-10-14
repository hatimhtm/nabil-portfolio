#!/usr/bin/env python3
"""Prints every piece of copy in src/ as one line each, whitespace collapsed: `page | text`.
Used to review the wording of the whole site in one read."""
import pathlib, re, sys
SRC = pathlib.Path(__file__).resolve().parent.parent / "src"
BLOCK = re.compile(r"<(p|li|td|th|h1|h2|h3|blockquote|dd|dt|figcaption|button)\b[^>]*>(.*?)</\1>|<(a|span|div|b)\b[^>]*class=\"[^\"]*(?:btn|chip|metric__v|metric__k|stat__k|case-card__id|case-card__tag|case-card__role|case-card__go|sechead__no|sechead__aside|chartpanel__title|chartpanel__note|factbox__head|exhibit__cap|lightbox__title|legend__item|lang__name|lang__note|honor__badge|honor__what|funnel__bar|flow__node|clock__city|go)[^\"]*\"[^>]*>(.*?)</\3>", re.S)
only = sys.argv[1:] 
for path in sorted((SRC / "pages").glob("*.html")):
    if only and path.name not in only: continue
    head, _, body = path.read_text().partition("\n---\n")
    for line in head.splitlines():
        k, _, v = line.partition(": ")
        if k in ("title", "description", "disclosure"): print(f"{path.name} | [{k}] {v}")
    seen = set()
    for m in BLOCK.finditer(body):
        text = re.sub(r"\s+", " ", (m.group(2) or m.group(4) or "")).strip()
        if text and not text.startswith("<svg") and text not in seen:
            seen.add(text); print(f"{path.name} | {text}")
