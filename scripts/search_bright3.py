#!/usr/bin/env python3
"""Поиск ярких кадров на Wikimedia Commons — третий заход.

Отличия от search_commons.py, ради которых написан отдельный скрипт:

* Commons агрессивно отдаёт 429. Здесь запросы идут медленно, а Retry-After
  читается из заголовка ответа, а не угадывается экспонентой.
* Каждый отфильтрованный кадр печатает причину отказа. В прошлый заход
  запросы «молча» возвращали ноль строк, и это выглядело как отсутствие
  подходящих фотографий, хотя на деле был рейт-лимит.
* Порог ширины снижен до 1200 px: кадр всё равно пойдёт через astro:assets
  и будет отдан в нескольких размерах, а слишком строгий порог отсекал
  хорошие горизонтальные снимки.

Результат дописывается в bright.json.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"
OUT_FILE = ".tmp/bright3.json"
UA = "cambodia-2027-landing/1.0 (tour landing page; image sourcing)"

DELAY_SECONDS = 5.0
MAX_RETRIES = 6
MIN_WIDTH = 1200

# Некоммерческие и запрещающие переработку лицензии не подходят: лендинг
# коммерческий. Маркеры проверяются по отдельным токенам, а не подстрокой,
# иначе "nd" ловится внутри безобидных слов.
BAD_LICENSE_TOKENS = {"nc", "nd", "by-nc", "by-nd", "by-nc-sa", "by-nc-nd"}
BAD_LICENSE_PHRASES = ("fair use", "non-free", "all rights reserved")

QUERIES = {
    "monk-waterfall": [
        "monk waterfall Cambodia",
        "Phnom Kulen waterfall monk",
        "Buddhist monks waterfall",
    ],
    "angkor-thom-gate": [
        "Angkor Thom south gate",
        "Angkor Thom gate sunset",
        "Angkor Thom causeway gate",
    ],
    "naga": [
        "naga balustrade Angkor",
        "Angkor Wat naga serpent",
        "Naga Angkor causeway",
    ],
}


def api(params: dict):
    params = {**params, "format": "json", "formatversion": "2"}
    url = f"{API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or attempt == MAX_RETRIES - 1:
                raise
            # Commons присылает Retry-After; уважаем его, но не меньше 5 с.
            wait = max(float(exc.headers.get("Retry-After") or 0), 5.0) * (attempt + 1)
            print(f"      429 — жду {wait:.0f}s", file=sys.stderr, flush=True)
            time.sleep(wait)
    raise RuntimeError("unreachable")


def clean(html):
    if not html:
        return ""
    out, depth = [], 0
    for ch in html:
        if ch == "<":
            depth += 1
        elif ch == ">":
            depth -= 1
        elif depth == 0:
            out.append(ch)
    return " ".join("".join(out).split())


def strip_tracking(url: str) -> str:
    """Убирает query-хвост из ссылки на файл.

    Commons с некоторых пор возвращает url вида
    `.../Angkor.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo`.
    Из-за этого проверка расширения по концу строки перестала срабатывать,
    и весь поиск молча возвращал ноль годных кадров.
    """
    return url.split("?", 1)[0]


def license_ok(lic: str) -> bool:
    low = lic.lower()
    if any(p in low for p in BAD_LICENSE_PHRASES):
        return False
    tokens = set(low.replace("cc", " ").replace("-", " ").split())
    return not (tokens & {"nc", "nd"})


def search(query: str, limit: int = 20):
    data = api(
        {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrnamespace": "6",
            "gsrlimit": str(limit),
            "prop": "imageinfo",
            "iiprop": "url|size|extmetadata",
            "iiurlwidth": "480",
        }
    )
    pages = data.get("query", {}).get("pages", []) or []
    rows, rejected = [], []
    for page in pages:
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {}) or {}
        title = page.get("title")
        lic = (meta.get("LicenseShortName", {}).get("value") or "")
        url = strip_tracking(info.get("url") or "")
        width = info.get("width") or 0

        if not license_ok(lic):
            rejected.append((title, f"лицензия {lic}"))
            continue
        if width < MIN_WIDTH:
            rejected.append((title, f"узкий {width}px"))
            continue
        if not url.lower().endswith((".jpg", ".jpeg", ".png")):
            rejected.append((title, "не растр"))
            continue

        rows.append(
            {
                "title": title,
                "creator": clean(meta.get("Artist", {}).get("value")),
                "license": lic,
                "license_url": meta.get("LicenseUrl", {}).get("value"),
                "url": url,
                "thumb": strip_tracking(info.get("thumburl") or ""),
                "width": width,
                "height": info.get("height"),
                "descriptionurl": info.get("descriptionurl"),
                "source": "Wikimedia Commons",
            }
        )
    return rows, rejected, len(pages)


def main():
    out = {}
    if os.path.exists(OUT_FILE):
        with open(OUT_FILE, encoding="utf-8") as fh:
            out = json.load(fh)

    only = sys.argv[1:]
    for slug, queries in QUERIES.items():
        if only and slug not in only:
            continue
        if out.get(slug):
            print(f"{slug}: уже есть {len(out[slug])}, пропуск", flush=True)
            continue

        seen, rows = set(), []
        for q in queries:
            try:
                found, rejected, total = search(q)
            except Exception as exc:  # noqa: BLE001
                print(f"  ! «{q}»: {type(exc).__name__} {exc}", file=sys.stderr, flush=True)
                time.sleep(DELAY_SECONDS)
                continue
            new = 0
            for r in found:
                if r["url"] in seen:
                    continue
                seen.add(r["url"])
                rows.append(r)
                new += 1
            print(
                f"  «{q}»: найдено {total}, годных {len(found)} (+{new} новых), "
                f"отсеяно {len(rejected)}",
                flush=True,
            )
            for t, why in rejected[:3]:
                print(f"      × {t} — {why}", flush=True)
            time.sleep(DELAY_SECONDS)

        out[slug] = rows
        print(f"{slug:20s} ИТОГО {len(rows)}\n", flush=True)
        with open(OUT_FILE, "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, indent=2)

    print(f"Всего: {sum(len(v) for v in out.values())} -> {OUT_FILE}")


if __name__ == "__main__":
    main()
