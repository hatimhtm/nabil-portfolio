#!/usr/bin/env python3
"""Builds the pages of NM · Equity Research from src/ into the site root.

    python3 tools/build.py

src/layout.html    the shell every page shares: head, masthead, navigation, tab bar, footer
src/pages/*.html   one file per page: a few "key: value" lines, a line of ---, then the page's content
src/jsonld.html    the Person record that goes in the head of the home page

The pages in the site root are OUTPUT. Edit the files in src/ and run this again; a change made
straight to a page in the root is lost on the next build. Python's standard library only.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
VERSION = "2.2"          # appended to the stylesheet and script addresses, so a release is never served stale
TOTAL = 8                # numbered pages in the report (the 404 page is not one of them)


def read_page(path):
    head, _, body = path.read_text().partition("\n---\n")
    meta = {}
    for line in head.splitlines():
        key, _, value = line.partition(": ")
        meta[key.strip()] = value.strip()
    return meta, body.rstrip("\n")


def label_cells(html):
    """Every body cell of a report table gets data-label="<its column heading>".
    On a phone the table is drawn as stacked rows, and the label is what names each value."""
    def table(match):
        block = match.group(0)
        heads = [re.sub(r"<[^>]+>", "", h).strip() for h in re.findall(r"<th[^>]*>(.*?)</th>", block, re.S)]
        if not heads:
            return block
        start = block.find("<tbody")

        def row(row_match):
            cells = iter(heads)

            def cell(cell_match):
                label = next(cells, "")
                tag = cell_match.group(0)
                if "data-label" in tag or not label:
                    return tag
                return tag[:-1] + f' data-label="{label}">'
            return re.sub(r"<td\b[^>]*>", cell, row_match.group(0))
        return block[:start] + re.sub(r"<tr\b.*?</tr>", row, block[start:], flags=re.S)
    return re.sub(r'<table class="tbl[^"]*">.*?</table>', table, html, flags=re.S)


def build():
    layout = (SRC / "layout.html").read_text()
    jsonld = (SRC / "jsonld.html").read_text()
    written = []
    for path in sorted((SRC / "pages").glob("*.html")):
        meta, body = read_page(path)
        nav = meta.get("nav", "")
        scripts = "\n".join(f'  <script src="{name}?v={VERSION}" defer></script>' for name in meta.get("scripts", "app.js").split())
        page = meta.get("page", "")
        values = {
            "title": meta["title"],
            "description": meta["description"],
            "og_title": meta.get("og_title", meta["title"]),
            "og_description": meta.get("og_description", meta["description"]),
            "head_extra": jsonld if meta["file"] == "index.html" else "",
            "body_class": meta.get("body", ""),
            "cur_overview": ' aria-current="page"' if nav == "overview" else "",
            "cur_coverage": ' aria-current="page"' if nav == "coverage" else "",
            "cur_profile": ' aria-current="page"' if nav == "profile" else "",
            "content": label_cells(body),
            "disclosure": meta.get("disclosure", ""),
            "folio": f"P.{page} / {TOTAL}" if page else "NOT ON FILE",
            "scripts": scripts,
            "version": VERSION,
        }
        out = layout
        for key, value in values.items():
            out = out.replace("{{" + key + "}}", value)
        left = re.findall(r"\{\{\w+\}\}", out)
        if left:
            raise SystemExit(f"{path.name}: unfilled {sorted(set(left))}")
        (ROOT / meta["file"]).write_text(out)
        written.append(meta["file"])
    print("built", len(written), "pages:", " ".join(written))


if __name__ == "__main__":
    build()
