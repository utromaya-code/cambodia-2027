#!/usr/bin/env python3
"""Поиск ярких кадров во Flickr через Openverse.

Зачем отдельно от search_bright.py: тот ходит только в Wikimedia Commons.
Commons — архив энциклопедии, там преобладают документальные снимки
(«дорога такая-то», «храм такой-то»), и именно поэтому подборка выходила
блёклой. Живая travel-фотография лежит во Flickr, и значительная её часть
опубликована под CC BY / CC BY-SA, то есть пригодна для коммерческого
использования при указании автора — что на сайте и делается в подвале.

Берём только лицензии, разрешающие коммерческое использование:
  cc0, pdm — без условий;
  by, by-sa — с указанием автора.
Лицензии NC (некоммерческие) и ND (запрет переработки) исключены: лендинг
продаёт поездку, а кадры кадрируются под вёрстку.

Результат дописывается в flickr.json.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.openverse.org/v1/images/"
OUT_FILE = ".tmp/ov2.json"
UA = "cambodia-2027-landing/1.0 (tour landing page; image sourcing)"

LICENSES = "cc0,pdm,by,by-sa"
PAGE_SIZE = 40
MIN_WIDTH = 900
DELAY = 1.5

QUERIES = {
    # Сюжеты, которые заказчик выбрал на присланных референсах
    # (все они были с водяными знаками Xiaohongshu — ищем аналоги под лицензией)
    "angkor-aerial": ["Angkor Wat aerial", "Angkor Wat drone", "Angkor Wat from above"],
    "angkor-gate-sunrise": ["Angkor Thom south gate", "Angkor Thom gate sunrise", "Angkor gate face towers road"],
    "angkor-sunrise-reflection": ["Angkor Wat sunrise reflection", "Angkor Wat lotus pond sunrise"],
    "kulen-waterfall-monks": ["Kulen waterfall monks", "Phnom Kulen waterfall", "Cambodia waterfall monk"],
    "bokor-kampot-hills": ["Bokor mountain Cambodia", "Kampot countryside", "Cambodia coast hills green"],
    "koh-rong-turquoise": ["Koh Rong turquoise", "Koh Rong boats", "Cambodia island turquoise water boat"],
    "tonle-sap-view": ["Battambang view", "Tonle Sap landscape", "Cambodia countryside panorama"],
    "rice-palms-mountains": ["Cambodia rice field sugar palm mountain", "Cambodia paddy palms"],
}


def _token():
    """Токен Openverse. Анонимные запросы лимитированы до отказа (401),
    поэтому ключ регистрируется один раз и кладётся в .tmp/ov_token."""
    try:
        with open(".tmp/ov_token", encoding="utf-8") as fh:
            return fh.read().strip()
    except OSError:
        return None


TOKEN = _token()


def api(params):
    url = API + "?" + urllib.parse.urlencode(params)
    headers = {"User-Agent": UA}
    if TOKEN:
        headers["Authorization"] = "Bearer " + TOKEN
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 503) and attempt < 4:
                wait = max(float(exc.headers.get("Retry-After") or 0), 5.0) * (attempt + 1)
                print("      %d — жду %.0fs" % (exc.code, wait), file=sys.stderr, flush=True)
                time.sleep(wait)
                continue
            raise
    raise RuntimeError("unreachable")


def search(query, source="flickr"):
    data = api({
        "q": query,
        "license": LICENSES,
        "page_size": str(PAGE_SIZE),
        "source": source,
    })
    rows, rejected = [], 0
    for r in data.get("results", []) or []:
        w = r.get("width") or 0
        if w < MIN_WIDTH:
            rejected += 1
            continue
        if not (r.get("url") or "").lower().split("?")[0].endswith((".jpg", ".jpeg", ".png")):
            rejected += 1
            continue
        lic = (r.get("license") or "").lower()
        if lic in ("nc", "nd") or "nc" in lic.split("-") or "nd" in lic.split("-"):
            rejected += 1
            continue
        rows.append({
            "title": r.get("title"),
            "creator": r.get("creator") or "не указан",
            "license": ("CC " + lic.upper() + " " + (r.get("license_version") or "")).strip(),
            "license_url": r.get("license_url"),
            "url": r.get("url"),
            "thumb": r.get("thumbnail") or r.get("url"),
            "width": w,
            "height": r.get("height"),
            "descriptionurl": r.get("foreign_landing_url"),
            "source": (r.get("source") or "flickr").capitalize(),
        })
    return rows, rejected, data.get("result_count", 0)


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
            print("%s: уже есть %d, пропуск" % (slug, len(out[slug])), flush=True)
            continue
        seen, rows = set(), []
        for q in queries:
            try:
                found, rejected, total = search(q)
            except Exception as exc:  # noqa: BLE001
                print("  ! «%s»: %s %s" % (q, type(exc).__name__, exc), file=sys.stderr, flush=True)
                time.sleep(DELAY)
                continue
            new = 0
            for r in found:
                if r["url"] in seen:
                    continue
                seen.add(r["url"])
                rows.append(r)
                new += 1
            print("  «%s»: всего %s, годных %d (+%d), отсеяно %d"
                  % (q, total, len(found), new, rejected), flush=True)
            time.sleep(DELAY)
        out[slug] = rows
        print("%-18s ИТОГО %d\n" % (slug, len(rows)), flush=True)
        with open(OUT_FILE, "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, indent=2)

    print("Всего: %d -> %s" % (sum(len(v) for v in out.values()), OUT_FILE))


if __name__ == "__main__":
    main()
