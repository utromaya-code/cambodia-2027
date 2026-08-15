#!/usr/bin/env python3
"""Поиск фотографий высокого разрешения на Wikimedia Commons.

Commons отдаёт оригиналы (часто 3000–6000 px) и полные данные о лицензии
и авторе в extmetadata, поэтому используется для крупных кадров лендинга.
Результат складывается в commons.json.
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

API = "https://commons.wikimedia.org/w/api.php"

# Commons ограничивает частоту запросов, поэтому идём медленно и с повторами.
DELAY_SECONDS = 2.0
MAX_RETRIES = 5

# Лицензии, которые нам не подходят (некоммерческие / с запретом переработки).
BAD_LICENSE_MARKERS = ("nc", "nd", "fair use", "non-free")

QUERIES = {
    "angkor-wat-sunrise": ["Angkor Wat sunrise", "Angkor Wat reflection pond"],
    "ta-prohm": ["Ta Prohm tree roots", "Ta Prohm"],
    "bayon": ["Bayon face towers", "Bayon temple"],
    "phnom-kulen": ["Phnom Kulen waterfall", "Phnom Kulen"],
    "beng-mealea": ["Beng Mealea", "Beng Mealea temple jungle"],
    "rural-road": ["Cambodia rural road", "Cambodia countryside road"],
    "motorcycle": ["Motorcycle Cambodia", "Cambodia motorbike road"],
    "battambang": ["Battambang bamboo train", "Phnom Sampeau"],
    "tonle-sap": ["Tonle Sap floating village", "Tonle Sap"],
    "kampong-chhnang": ["Kampong Chhnang pottery", "Kampong Chhnang"],
    "kirirom": ["Kirirom National Park", "Kirirom pine"],
    "kampot": ["Kampot riverside", "Kampot Cambodia architecture"],
    "bokor": ["Bokor Hill Station", "Preah Monivong Bokor National Park"],
    "pepper-farm": ["Kampot pepper plantation", "Kampot pepper"],
    "salt-fields": ["Kampot salt field", "Kep salt"],
    "ream": ["Ream National Park", "Cambodia mangrove"],
    "sihanoukville": ["Sihanoukville beach", "Sihanoukville Cambodia coast"],
    "koh-rong": ["Koh Rong", "Koh Rong Sanloem beach"],
    "market": ["Cambodia market", "Cambodian street food"],
    "rice-fields": ["Cambodia rice field", "Cambodia paddy field"],
    "village": ["Cambodian village house", "Cambodia stilt house"],
    "monks": ["Cambodian monks", "Cambodia monk temple"],
    "angkor-thom": ["Angkor Thom gate", "Angkor causeway"],
    "kep": ["Kep Cambodia", "Kep crab market"],
    # Добавлено для visual-редизайна: люди/группа/движение — то, чего
    # не хватало в первом заходе (сплошь пейзаж и архитектура).
    "riders-group": ["motorcycle riders group Asia", "adventure motorcycle group Southeast Asia"],
    "helmet-gear": ["motorcycle helmet rider gear", "motorbike rider hands handlebar"],
    "angkor-motorbike": ["motorbike Angkor temple", "motorcycle Cambodia temple road"],
    "bokor-road-bike": ["Bokor mountain road motorcycle", "Preah Monivong Bokor road serpentine"],
    "kampot-night": ["Kampot night market", "Kampot evening street lights"],
    "cambodia-portrait": ["Cambodia rural portrait", "Cambodia countryside person road"],
    "dust-motion": ["dirt road dust motorcycle motion", "Cambodia dust road riding"],
    # Третий заход: первая выборка отвергнута заказчиком как блёклая и
    # «пыльная». Здесь ищем осознанно насыщенные кадры — рассвет, вода,
    # тропическая зелень, тёплый свет на камне. Это то, ради чего едут.
    "angkor-dawn": [
        "Angkor Wat sunrise reflection pond",
        "Angkor Wat dawn sky",
        "Angkor Wat lotus pond morning",
    ],
    "waterfall": [
        "Cambodia waterfall jungle",
        "Phnom Kulen waterfall Cambodia",
        "Cambodia cascade tropical forest",
    ],
    "turquoise-sea": [
        "Koh Rong turquoise water",
        "Koh Rong Sanloem beach clear water",
        "Cambodia tropical beach turquoise",
    ],
    "jungle-lush": [
        "Cambodia tropical rainforest canopy",
        "Cardamom Mountains forest Cambodia",
        "Cambodia jungle green foliage",
    ],
    "temple-warm-light": [
        "Bayon temple golden light",
        "Angkor temple warm sunset light",
        "Ta Prohm sunlight jungle temple",
    ],
    "rice-green": [
        "Cambodia rice paddy green landscape",
        "Cambodia paddy field sugar palm",
    ],
    "palm-sunset": [
        "Cambodia sugar palm sunset",
        "Cambodia sunset rice field palm silhouette",
    ],
    "lotus": ["Cambodia lotus flower pond", "lotus pond Angkor Cambodia"],
    "monk-robes": [
        "Cambodian monk orange robe temple",
        "Buddhist monks Angkor Cambodia",
    ],
    "kep-coast": ["Kep Cambodia coast", "Cambodia coastline sunset sea"],
}


def api(params: dict):
    params = {**params, "format": "json", "formatversion": "2"}
    url = f"{API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url, headers={"User-Agent": "cambodia-2027-landing/1.0 (image sourcing)"}
    )
    delay = DELAY_SECONDS
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or attempt == MAX_RETRIES - 1:
                raise
            delay *= 2
            print(f"    429, пауза {delay:.0f}s", file=sys.stderr)
            time.sleep(delay)
    raise RuntimeError("unreachable")


def clean(html: str | None) -> str:
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


def search(query: str, limit: int = 12):
    try:
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
    except Exception as exc:  # noqa: BLE001
        print(f"  ! {query}: {exc}", file=sys.stderr)
        return []

    rows = []
    for page in data.get("query", {}).get("pages", []) or []:
        info = (page.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {}) or {}
        lic = (meta.get("LicenseShortName", {}).get("value") or "").lower()
        if any(m in lic for m in BAD_LICENSE_MARKERS):
            continue
        if (info.get("width") or 0) < 1600:
            continue
        if not (info.get("url") or "").lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        rows.append(
            {
                "title": page.get("title"),
                "creator": clean(meta.get("Artist", {}).get("value")),
                "license": meta.get("LicenseShortName", {}).get("value"),
                "license_url": meta.get("LicenseUrl", {}).get("value"),
                "url": info.get("url"),
                "thumb": info.get("thumburl"),
                "width": info.get("width"),
                "height": info.get("height"),
                "descriptionurl": info.get("descriptionurl"),
                "source": "Wikimedia Commons",
            }
        )
    return rows


def main():
    # Уже собранное не перезапрашиваем — дозаполняем только пустые рубрики.
    out = {}
    if os.path.exists("commons.json"):
        with open("commons.json", encoding="utf-8") as fh:
            out = json.load(fh)

    only = sys.argv[1:]
    for slug, queries in QUERIES.items():
        if only and slug not in only:
            continue
        if out.get(slug):
            continue
        seen, rows = set(), []
        for q in queries:
            for r in search(q):
                if r["url"] in seen:
                    continue
                seen.add(r["url"])
                rows.append(r)
            time.sleep(DELAY_SECONDS)
        out[slug] = rows
        print(f"{slug:20s} {len(rows):2d}", flush=True)
        with open("commons.json", "w", encoding="utf-8") as fh:
            json.dump(out, fh, ensure_ascii=False, indent=2)

    print(f"\nВсего: {sum(len(v) for v in out.values())} -> commons.json")


if __name__ == "__main__":
    main()
