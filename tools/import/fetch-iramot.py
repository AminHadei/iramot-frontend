#!/usr/bin/env python3
"""Pull public IRAMOT WordPress content into content/*.json and public/media."""

from __future__ import annotations

import json
import re
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import escape, unescape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "content"
MEDIA_ROOT = ROOT / "public" / "media"
DOCS = ROOT / "docs" / "iramot-inventory.md"
BASE = "https://iramot.ir/wp-json/wp/v2"
ORIGIN = "https://iramot.ir"
PER_PAGE = 100
CTX = ssl._create_unverified_context()

# rest_base values from /wp-json/wp/v2/types, except the font-face route template.
PROBE_BASES = [
    "posts",
    "pages",
    "media",
    "menu-items",
    "blocks",
    "templates",
    "template-parts",
    "global-styles",
    "navigation",
    "font-families",
    "e-floating-buttons",
    "elementor_library",
    "product",
    "bp-member-type",
    "rm_content_editor",
    "jet-engine",
    "events",
    "word_choosing",
]

KEEP_FILES = {
    "posts": "posts.json",
    "pages": "pages.json",
    "categories": "categories.json",
    "tags": "tags.json",
    "media": "media.json",
    "events": "events.json",
    "word_choosing": "word-choosing.json",
}

CONTENT_TYPES = ("posts", "pages", "events", "word_choosing")
VOID = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
DROP_KEYS = {"_links", "guid", "yoast_head", "yoast_head_json"}
UPLOAD_RE = re.compile(
    r"(?:https?:)?//(?:www\.)?iramot\.ir/wp-content/uploads/([^\"'\\\s<>\[]+)",
    re.IGNORECASE,
)
REL_UPLOAD_RE = re.compile(
    r"(?<=[\"'(])(/wp-content/uploads/[^\"'\s<>]+)",
    re.IGNORECASE,
)
DEMO_MARKERS = ("buddyboss", "bb-demo", "hello world", "سلام دنیا")
NOT_FOUND_SLUGS = {"404", "404-2", "not-found", "page-not-found"}
NOT_FOUND_TITLES = {"404", "404 not found", "page not found", "صفحه پیدا نشد"}


def log(message: str) -> None:
    print(message, flush=True)


def is_elementor_token(value: str) -> bool:
    token = value.strip().lower()
    return "elementor" in token or token.startswith("e-")


def is_elementor_key(key: str) -> bool:
    name = key.lower()
    return "elementor" in name or name.startswith("e-")


class Cleaner(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=False)
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.parts.append(self._open(tag, attrs, tag in VOID))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.parts.append(self._open(tag, attrs, True))

    def handle_endtag(self, tag: str) -> None:
        if tag not in VOID:
            self.parts.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        self.parts.append(data)

    def handle_entityref(self, name: str) -> None:
        self.parts.append(f"&{name};")

    def handle_charref(self, name: str) -> None:
        self.parts.append(f"&#{name};")

    def handle_comment(self, data: str) -> None:
        self.parts.append(f"<!--{data}-->")

    def _open(self, tag: str, attrs: list[tuple[str, str | None]], close: bool) -> str:
        rendered: list[str] = []
        for key, value in clean_attrs(attrs):
            if value is None:
                rendered.append(key)
            else:
                rendered.append(f'{key}="{escape(value, quote=True)}"')
        body = (" " + " ".join(rendered)) if rendered else ""
        if close:
            return f"<{tag}{body}>"
        return f"<{tag}{body}>"


def clean_attrs(attrs: list[tuple[str, str | None]]) -> list[tuple[str, str | None]]:
    cleaned: list[tuple[str, str | None]] = []
    for key, value in attrs:
        lower = key.lower()
        if lower.startswith("data-") and is_elementor_key(lower):
            continue
        if lower == "class" and value is not None:
            kept = [token for token in value.split() if not is_elementor_token(token)]
            if kept:
                cleaned.append((key, " ".join(kept)))
            continue
        if lower == "id" and value is not None and is_elementor_token(value):
            continue
        cleaned.append((key, value))
    return cleaned


def clean_html(value: str) -> str:
    if not value:
        return ""
    parser = Cleaner()
    parser.feed(value)
    parser.close()
    return "".join(parser.parts).strip()


def plain_title(item: dict) -> str:
    title = item.get("title")
    if isinstance(title, dict):
        title = title.get("rendered") or ""
    return unescape(re.sub(r"<[^>]+>", "", str(title or ""))).strip()


def plain_slug(item: dict) -> str:
    return urllib.parse.unquote(str(item.get("slug") or ""))


def rendered(item: dict, key: str) -> str:
    value = item.get(key)
    if isinstance(value, dict):
        return str(value.get("rendered") or "")
    if isinstance(value, str):
        return value
    return ""


def upload_key(raw: str) -> str | None:
    path = urllib.parse.unquote(raw.split("#", 1)[0].split("?", 1)[0]).lstrip("/")
    path = path.split("[", 1)[0].rstrip("\\").strip()
    if not path or ".." in path.split("/"):
        return None
    return path


def find_upload_keys(text: str) -> set[str]:
    keys: set[str] = set()
    if not text:
        return keys
    for match in UPLOAD_RE.finditer(text):
        key = upload_key(match.group(1))
        if key:
            keys.add(key)
    for match in REL_UPLOAD_RE.finditer(text):
        key = upload_key(match.group(1).split("/wp-content/uploads/", 1)[-1])
        if key:
            keys.add(key)
    return keys


def rewrite_uploads(text: str, saved: dict[str, str]) -> str:
    if not text:
        return ""

    def absolute(match: re.Match[str]) -> str:
        key = upload_key(match.group(1))
        if key and key in saved:
            return saved[key]
        return match.group(0)

    def relative(match: re.Match[str]) -> str:
        key = upload_key(match.group(1).split("/wp-content/uploads/", 1)[-1])
        if key and key in saved:
            return saved[key]
        return match.group(0)

    return REL_UPLOAD_RE.sub(relative, UPLOAD_RE.sub(absolute, text))


def request_json(url: str) -> tuple[dict[str, str], object]:
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=CTX, timeout=120) as response:
                headers = {key.lower(): value for key, value in response.headers.items()}
                payload = json.loads(response.read().decode("utf-8", "replace"))
                return headers, payload
        except Exception as error:  # noqa: BLE001 - retry network and HTTP failures
            last_error = error
            if isinstance(error, urllib.error.HTTPError) and error.code in {401, 403, 404}:
                raise
            time.sleep(1.5 * (attempt + 1))
    assert last_error is not None
    raise last_error


def fetch_collection(rest_base: str) -> tuple[list, int | None, str | None]:
    items: list = []
    page = 1
    total: int | None = None
    while True:
        url = f"{BASE}/{rest_base}?per_page={PER_PAGE}&page={page}&orderby=id&order=asc"
        log(f"fetch {rest_base} page {page}")
        try:
            headers, payload = request_json(url)
        except urllib.error.HTTPError as error:
            if page == 1:
                return [], None, f"HTTP {error.code}"
            raise
        if isinstance(payload, dict) and payload.get("code"):
            return [], None, str(payload.get("code"))
        if not isinstance(payload, list):
            return [], None, "not a list"
        if total is None and headers.get("x-wp-total"):
            total = int(headers["x-wp-total"])
        items.extend(payload)
        pages = int(headers.get("x-wp-totalpages") or 1)
        if page >= pages or not payload:
            break
        page += 1
    return items, total if total is not None else len(items), None


def strip_fields(item: dict) -> dict:
    fields: dict = {}
    for key, value in item.items():
        if key in DROP_KEYS or is_elementor_key(key):
            continue
        if key in {
            "id",
            "slug",
            "date",
            "modified",
            "link",
            "title",
            "excerpt",
            "content",
            "categories",
            "tags",
            "featured_media",
            "status",
            "type",
        }:
            continue
        cleaned = clean_value(value)
        if cleaned not in (None, "", [], {}):
            fields[key] = cleaned
    return fields


def clean_value(value):
    if isinstance(value, str):
        if "<" in value and ">" in value:
            return clean_html(value)
        return value
    if isinstance(value, list):
        return [clean_value(item) for item in value]
    if isinstance(value, dict):
        cleaned = {}
        for key, item in value.items():
            if is_elementor_key(str(key)):
                continue
            cleaned[key] = clean_value(item)
        return cleaned
    return value


def term_map(items: list[dict]) -> dict[int, dict]:
    mapped: dict[int, dict] = {}
    for item in items:
        mapped[int(item["id"])] = {
            "id": item.get("id"),
            "slug": plain_slug(item),
            "name": unescape(str(item.get("name") or "")),
        }
    return mapped


def resolve_terms(ids: object, terms: dict[int, dict]) -> list[dict]:
    if not isinstance(ids, list):
        return []
    resolved = []
    for term_id in ids:
        try:
            resolved.append(terms[int(term_id)])
        except (TypeError, ValueError, KeyError):
            resolved.append({"id": term_id, "slug": "", "name": ""})
    return resolved


def demo_reason(title: str, slug: str, raw: str) -> str | None:
    haystack = f"{title}\n{slug}\n{raw}".lower()
    for marker in DEMO_MARKERS:
        if marker in haystack:
            return f"matches {marker}"
    return None


def is_not_found_page(title: str, slug: str) -> bool:
    return slug.lower() in NOT_FOUND_SLUGS or title.lower() in NOT_FOUND_TITLES


def is_sample_page(title: str, slug: str) -> bool:
    return title == "برگه نمونه" or slug in {"برگه-نمونه", "نمونه"}


def is_shop_page(title: str, slug: str) -> bool:
    return slug == "shop" or title == "فروشگاه"


def content_record(item: dict, categories: dict[int, dict], tags: dict[int, dict]) -> dict:
    record = {
        "id": item.get("id"),
        "slug": plain_slug(item),
        "status": item.get("status"),
        "date": item.get("date"),
        "modified": item.get("modified"),
        "link": item.get("link"),
        "title": plain_title(item),
        "excerpt": clean_html(rendered(item, "excerpt")),
        "content": clean_html(rendered(item, "content")),
        "featuredMedia": item.get("featured_media") or None,
    }
    if "categories" in item:
        record["categories"] = resolve_terms(item.get("categories"), categories)
    if "tags" in item:
        record["tags"] = resolve_terms(item.get("tags"), tags)
    fields = strip_fields(item)
    if fields:
        record["fields"] = fields
    return record


def term_record(item: dict) -> dict:
    return {
        "id": item.get("id"),
        "slug": plain_slug(item),
        "name": unescape(str(item.get("name") or "")),
        "description": clean_html(str(item.get("description") or "")),
        "count": item.get("count"),
        "parent": item.get("parent") or 0,
        "link": item.get("link"),
    }


def media_record(item: dict, local_path: str | None) -> dict:
    details = item.get("media_details") if isinstance(item.get("media_details"), dict) else {}
    return {
        "id": item.get("id"),
        "slug": plain_slug(item),
        "mime": item.get("mime_type"),
        "sourceUrl": item.get("source_url"),
        "alt": unescape(str(item.get("alt_text") or "")),
        "width": details.get("width"),
        "height": details.get("height"),
        "localPath": local_path,
    }


def collect_keys_from_record(record: dict) -> set[str]:
    blob = json.dumps(record, ensure_ascii=False)
    return find_upload_keys(blob)


def download_one(key: str) -> tuple[str, str | None, str | None]:
    destination = MEDIA_ROOT / key
    public_path = "/media/" + key
    if destination.exists() and destination.stat().st_size > 0:
        return key, public_path, None
    url = ORIGIN + "/wp-content/uploads/" + urllib.parse.quote(key, safe="/")
    last_error = "download failed"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=CTX, timeout=90) as response:
                data = response.read()
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(data)
            return key, public_path, None
        except Exception as error:  # noqa: BLE001
            last_error = f"{type(error).__name__}: {error}"
            time.sleep(0.8 * (attempt + 1))
    return key, None, last_error


def rewrite_record(record: dict, saved: dict[str, str]) -> dict:
    def walk(value):
        if isinstance(value, str):
            return rewrite_uploads(value, saved)
        if isinstance(value, list):
            return [walk(item) for item in value]
        if isinstance(value, dict):
            return {key: walk(item) for key, item in value.items()}
        return value

    return walk(record)


def write_json(name: str, payload: object) -> None:
    path = CONTENT / name
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    log(f"wrote {path.relative_to(ROOT)} ({len(payload) if isinstance(payload, list) else 1})")


def md_cell(value: object) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ")


def write_inventory(
    counts: dict[str, int],
    pages: list[dict],
    aside: list[dict],
    unavailable: list[tuple[str, str]],
    failures: list[tuple[str, str]],
    probed: list[tuple[str, int]],
    not_found_found: bool,
) -> None:
    lines = [
        "# IRAMOT inventory",
        "",
        "Pulled from `https://iramot.ir/wp-json/wp/v2` with TLS verification disabled. Placeholder pages already in `content/` were left unchanged.",
        "",
        "## Kept",
        "",
        "| Type | File | Count |",
        "| --- | --- | --- |",
    ]
    file_for = {
        "posts": "content/posts.json",
        "pages": "content/pages.json",
        "categories": "content/categories.json",
        "tags": "content/tags.json",
        "events": "content/events.json",
        "word_choosing": "content/word-choosing.json",
        "media": "content/media.json",
    }
    for key, filename in file_for.items():
        lines.append(f"| `{key}` | `{filename}` | {counts.get(key, 0)} |")
    lines.extend(["", "## Pages", ""])
    lines.append("| ID | Slug | Title |")
    lines.append("| --- | --- | --- |")
    for page in sorted(pages, key=lambda item: int(item["id"])):
        lines.append(
            f"| {page['id']} | `{md_cell(page['slug'])}` | {md_cell(page['title'])} |"
        )
    lines.extend(["", "## Set aside", ""])
    if not aside:
        lines.append("None.")
    else:
        for item in aside:
            lines.append(
                f"- `{item['type']}` {item['id']} `{md_cell(item['slug'])}` — {md_cell(item['title'])}. {md_cell(item['reason'])}"
            )
    if not not_found_found:
        lines.append("")
        lines.append("No page slug or title is a 404 page.")
    lines.extend(["", "## Other probed collections", ""])
    lines.append("These `rest_base` values returned a list and were not written to `content/*.json`.")
    lines.append("")
    for base, count in probed:
        lines.append(f"- `{base}`: {count}")
    lines.extend(["", "## Unavailable REST types", ""])
    lines.append(
        "`wp_font_face` is a route template (`font-families/(?P<font_family_id>[\\d]+)/font-faces`), not a collection. It was not fetched."
    )
    lines.append("")
    if not unavailable:
        lines.append("Every other probed `rest_base` returned a list.")
    else:
        for base, reason in unavailable:
            lines.append(f"- `{base}`: {reason}")
    lines.extend(["", "## Media downloads", ""])
    header_total = counts.get("media_header")
    listed = counts.get("media")
    if header_total and header_total != listed:
        lines.append(
            f"The media endpoint reports `X-WP-Total` {header_total}. "
            f"Two full fetches with `orderby=id&order=asc` each returned the same {listed} attachments. "
            "The items named by the header and absent from both lists were not invented."
        )
        lines.append("")
    lines.append(f"Saved files under `public/media/`: {counts.get('media_saved', 0)}.")
    lines.append(f"Failed downloads: {len(failures)}.")
    if failures:
        lines.append("")
        lines.append("<!-- cspell:disable -->")
        for key, error in failures:
            lines.append(f"- `{md_cell(key)}`: {md_cell(error)}")
        lines.append("<!-- cspell:enable -->")
    lines.append("")
    DOCS.write_text("\n".join(lines), encoding="utf-8")
    log(f"wrote {DOCS.relative_to(ROOT)}")


def self_test() -> None:
    sample = (
        '<div class="elementor-widget e-con keep" id="elementor-tab-1" data-elementor-type="wp-page">'
        '<img class="e-flex photo" src="https://iramot.ir/wp-content/uploads/2024/01/a.jpg">'
        "</div>"
    )
    cleaned = clean_html(sample)
    assert "elementor" not in cleaned
    assert "e-con" not in cleaned
    assert "e-flex" not in cleaned
    assert "keep" in cleaned
    assert "photo" in cleaned
    assert "data-elementor-type" not in cleaned
    rewritten = rewrite_uploads(cleaned, {"2024/01/a.jpg": "/media/2024/01/a.jpg"})
    assert rewritten.count("/media/2024/01/a.jpg") == 1
    dumped = json.dumps({"src": "https://iramot.ir/wp-content/uploads/2024/01/a.jpg"})
    assert find_upload_keys(dumped) == {"2024/01/a.jpg"}
    shortcode = "https://iramot.ir/wp-content/uploads/2021/10/file.mp4[/vc_column_text]"
    assert find_upload_keys(shortcode) == {"2021/10/file.mp4"}
    assert demo_reason("Hello world", "hello-world", "") == "matches hello world"
    assert is_sample_page("برگه نمونه", "برگه-نمونه")
    assert is_shop_page("فروشگاه", "shop")
    log("self-test ok")


def main() -> None:
    self_test()
    CONTENT.mkdir(parents=True, exist_ok=True)
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)

    raw: dict[str, list] = {}
    totals: dict[str, int] = {}
    unavailable: list[tuple[str, str]] = []
    for base in PROBE_BASES:
        if base in {"categories", "tags"}:
            continue
        try:
            items, total, error = fetch_collection(base)
        except urllib.error.HTTPError as error:
            unavailable.append((base, f"HTTP {error.code}"))
            log(f"unavailable {base} HTTP {error.code}")
            continue
        if error:
            unavailable.append((base, error))
            log(f"unavailable {base} {error}")
            continue
        raw[base] = items
        totals[base] = total or len(items)
        log(f"got {base} {len(items)} header-total {totals[base]}")

    for base in ("categories", "tags"):
        items, total, error = fetch_collection(base)
        if error:
            raise SystemExit(f"{base} failed: {error}")
        raw[base] = items
        totals[base] = total or len(items)
        log(f"got {base} {len(items)}")

    categories = term_map(raw.get("categories", []))
    tags = term_map(raw.get("tags", []))
    products = raw.get("product", [])
    shop_empty = len(products) == 0

    aside: list[dict] = []
    kept: dict[str, list] = {key: [] for key in CONTENT_TYPES}

    for kind in CONTENT_TYPES:
        for item in raw.get(kind, []):
            title = plain_title(item)
            slug = plain_slug(item)
            raw_html = rendered(item, "content") + "\n" + rendered(item, "excerpt")
            reason = None
            if kind == "pages" and is_sample_page(title, slug):
                reason = "sample page برگه نمونه"
            elif kind == "pages" and is_not_found_page(title, slug):
                reason = "404 page"
            elif kind == "pages" and shop_empty and is_shop_page(title, slug):
                reason = "shop page; product endpoint returned no products"
            elif kind == "posts":
                reason = demo_reason(title, slug, raw_html)
            if reason:
                aside.append(
                    {
                        "type": kind,
                        "id": item.get("id"),
                        "slug": slug,
                        "title": title,
                        "reason": reason,
                    }
                )
                continue
            kept[kind].append(content_record(item, categories, tags))

    if shop_empty:
        aside.append(
            {
                "type": "product",
                "id": "",
                "slug": "product",
                "title": "products",
                "reason": f"product endpoint total {len(products)}; empty shop was not written to JSON",
            }
        )

    not_found_found = any(item["reason"] == "404 page" for item in aside)

    media_items = raw.get("media", [])
    keys: set[str] = set()
    for item in media_items:
        source = str(item.get("source_url") or "")
        keys.update(find_upload_keys(source))
        if "/wp-content/uploads/" in source:
            key = upload_key(source.split("/wp-content/uploads/", 1)[1])
            if key:
                keys.add(key)
    for records in kept.values():
        for record in records:
            keys.update(collect_keys_from_record(record))
    for item in raw.get("categories", []) + raw.get("tags", []):
        keys.update(find_upload_keys(str(item.get("description") or "")))

    log(f"download {len(keys)} upload files")
    saved: dict[str, str] = {}
    failures: list[tuple[str, str]] = []
    done = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(download_one, key) for key in sorted(keys)]
        for future in as_completed(futures):
            key, public_path, error = future.result()
            done += 1
            if public_path:
                saved[key] = public_path
            else:
                failures.append((key, error or "download failed"))
            if done % 50 == 0 or done == len(keys):
                log(f"downloaded {done}/{len(keys)} failed {len(failures)}")

    media_by_id = {int(item["id"]): item for item in media_items if item.get("id") is not None}

    def attach_featured(record: dict) -> dict:
        media_id = record.get("featuredMedia")
        featured = None
        if media_id:
            source = media_by_id.get(int(media_id))
            source_url = source.get("source_url") if source else None
            local = None
            if source_url and "/wp-content/uploads/" in source_url:
                key = upload_key(source_url.split("/wp-content/uploads/", 1)[1])
                local = saved.get(key) if key else None
            featured = {"id": media_id, "sourceUrl": source_url, "localPath": local}
        record["featuredImage"] = featured
        record.pop("featuredMedia", None)
        return rewrite_record(record, saved)

    for kind in CONTENT_TYPES:
        kept[kind] = [attach_featured(record) for record in kept[kind]]

    category_records = [rewrite_record(term_record(item), saved) for item in raw.get("categories", [])]
    tag_records = [rewrite_record(term_record(item), saved) for item in raw.get("tags", [])]
    media_records = []
    for item in media_items:
        source = str(item.get("source_url") or "")
        local = None
        if "/wp-content/uploads/" in source:
            key = upload_key(source.split("/wp-content/uploads/", 1)[1])
            local = saved.get(key) if key else None
        media_records.append(media_record(item, local))

    write_json("posts.json", kept["posts"])
    write_json("pages.json", kept["pages"])
    write_json("categories.json", category_records)
    write_json("tags.json", tag_records)
    write_json("events.json", kept["events"])
    write_json("word-choosing.json", kept["word_choosing"])
    write_json("media.json", media_records)

    counts = {
        "posts": len(kept["posts"]),
        "pages": len(kept["pages"]),
        "categories": len(category_records),
        "tags": len(tag_records),
        "events": len(kept["events"]),
        "word_choosing": len(kept["word_choosing"]),
        "media": len(media_records),
        "media_header": totals.get("media"),
        "media_saved": len(saved),
    }
    probed = [
        (base, len(items))
        for base, items in raw.items()
        if base not in KEEP_FILES and base not in {"categories", "tags"}
    ]
    write_inventory(
        counts,
        kept["pages"],
        aside,
        unavailable,
        failures,
        probed,
        not_found_found,
    )


CONTENT_JSON = (
    "posts.json",
    "pages.json",
    "categories.json",
    "tags.json",
    "events.json",
    "word-choosing.json",
)


def files_on_disk() -> dict[str, str]:
    saved: dict[str, str] = {}
    if not MEDIA_ROOT.exists():
        return saved
    for path in MEDIA_ROOT.rglob("*"):
        if path.is_file() and path.stat().st_size > 0 and path.name != ".gitkeep":
            key = path.relative_to(MEDIA_ROOT).as_posix()
            saved[key] = "/media/" + key
    return saved


def download_missing(keys: set[str], saved: dict[str, str]) -> list[tuple[str, str]]:
    missing = sorted(key for key in keys if key not in saved)
    log(f"repair download {len(missing)} missing of {len(keys)}")
    failures: list[tuple[str, str]] = []
    done = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(download_one, key) for key in missing]
        for future in as_completed(futures):
            key, public_path, error = future.result()
            done += 1
            if public_path:
                saved[key] = public_path
            else:
                failures.append((key, error or "download failed"))
            if done % 25 == 0 or done == len(missing):
                log(f"repaired {done}/{len(missing)} failed {len(failures)}")
    failures.sort()
    return failures


def repair() -> None:
    """Download upload URLs the first pass missed, then rewrite kept JSON."""
    self_test()
    saved = files_on_disk()
    keys: set[str] = set()
    loaded: dict[str, object] = {}
    for name in CONTENT_JSON:
        payload = json.loads((CONTENT / name).read_text(encoding="utf-8"))
        loaded[name] = payload
        keys.update(find_upload_keys(json.dumps(payload, ensure_ascii=False)))
    media = json.loads((CONTENT / "media.json").read_text(encoding="utf-8"))
    for item in media:
        source = str(item.get("sourceUrl") or "")
        if "/wp-content/uploads/" in source:
            key = upload_key(source.split("/wp-content/uploads/", 1)[1])
            if key:
                keys.add(key)
    failures = download_missing(keys, saved)
    for name, payload in loaded.items():
        write_json(name, rewrite_record(payload, saved))
    for item in media:
        source = str(item.get("sourceUrl") or "")
        local = item.get("localPath")
        if "/wp-content/uploads/" in source:
            key = upload_key(source.split("/wp-content/uploads/", 1)[1])
            if key and key in saved:
                local = saved[key]
        item["localPath"] = local
    write_json("media.json", media)
    on_disk = files_on_disk()
    text = DOCS.read_text(encoding="utf-8")
    head, _sep, _tail = text.partition("## Media downloads")
    lines = [
        "## Media downloads",
        "",
        "The media endpoint reports `X-WP-Total` 1977. "
        "Two full fetches with `orderby=id&order=asc` each returned the same 1901 attachments. "
        "The items named by the header and absent from both lists were not invented.",
        "",
        f"Saved files under `public/media/`: {len(on_disk)}.",
        f"Failed downloads: {len(failures)}.",
    ]
    if failures:
        lines.append("")
        lines.append("<!-- cspell:disable -->")
        for key, error in failures:
            lines.append(f"- `{md_cell(key)}`: {md_cell(error)}")
        lines.append("<!-- cspell:enable -->")
    lines.append("")
    DOCS.write_text(head + "\n".join(lines), encoding="utf-8")
    log(f"wrote {DOCS.relative_to(ROOT)}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--repair":
        repair()
    else:
        main()
