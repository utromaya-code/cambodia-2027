#!/usr/bin/env python3
"""Поиск фотографий с лицензией, разрешающей коммерческое использование.

Ищет в Openverse (агрегатор Wikimedia Commons, Flickr и др.) и сохраняет
кандидатов в candidates.json вместе с данными об авторе и лицензии.
Ничего не скачивает — только собирает список для ручного отбора.
"""
import json
import sys
import urllib.parse
import urllib.request

API = "https://api.openverse.org/v1/images/"

# Только лицензии, разрешающие коммерческое использование и переработку.
LICENSES = "cc0,pdm,by,by-sa"

QUERIES = {
    "angkor-wat-sunrise": ["angkor wat sunrise", "angkor wat reflection"],
    "ta-prohm": ["ta prohm tree", "ta prohm temple roots"],
    "bayon": ["bayon faces", "bayon temple angkor thom"],
    "phnom-kulen": ["phnom kulen waterfall", "phnom kulen cambodia"],
    "beng-mealea": ["beng mealea", "beng mealea jungle temple"],
    "rural-road": ["cambodia dirt road", "cambodia countryside road red"],
    "motorcycle": ["motorcycle cambodia road", "motorbike cambodia countryside"],
    "battambang": ["battambang bamboo train", "phnom sampov battambang"],
    "tonle-sap": ["tonle sap floating village", "tonle sap fishing boats"],
    "kampong-chhnang": ["kampong chhnang pottery", "kampong chhnang cambodia"],
    "kirirom": ["kirirom national park", "kirirom pine forest cambodia"],
    "kampot": ["kampot river cambodia", "kampot colonial architecture"],
    "bokor": ["bokor mountain cambodia", "bokor hill station road"],
    "pepper-farm": ["kampot pepper farm", "kampot pepper plantation"],
    "salt-fields": ["kampot salt fields", "kep salt field cambodia"],
    "ream": ["ream national park cambodia", "cambodia mangrove coast"],
    "sihanoukville": ["sihanoukville beach", "sihanoukville coast cambodia"],
    "koh-rong": ["koh rong island", "koh rong beach cambodia"],
    "market": ["cambodia market street", "phnom penh street food market"],
    "rice-fields": ["cambodia rice field", "cambodia rice paddy sunset"],
    "village": ["cambodia village stilt house", "cambodian village life"],
    "monks": ["cambodia monks temple", "cambodian monk orange robes"],
}


def search(query: str, page_size: int = 8):
    params = urllib.parse.urlencode(
        {
            "q": query,
            "license": LICENSES,
            "page_size": page_size,
            "mature": "false",
        }
    )
    req = urllib.request.Request(
        f"{API}?{params}",
        headers={"User-Agent": "cambodia-2027-landing/1.0 (image sourcing)"},
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return json.load(resp).get("results", [])
    except Exception as exc:  # noqa: BLE001
        print(f"  ! {query}: {exc}", file=sys.stderr)
        return []


def main():
    out = {}
    for slug, queries in QUERIES.items():
        seen = set()
        rows = []
        for q in queries:
            for r in search(q):
                url = r.get("url")
                if not url or url in seen:
                    continue
                seen.add(url)
                rows.append(
                    {
                        "title": r.get("title"),
                        "creator": r.get("creator"),
                        "license": r.get("license"),
                        "license_version": r.get("license_version"),
                        "license_url": r.get("license_url"),
                        "foreign_landing_url": r.get("foreign_landing_url"),
                        "url": url,
                        "width": r.get("width"),
                        "height": r.get("height"),
                        "source": r.get("source"),
                        "attribution": r.get("attribution"),
                    }
                )
        out[slug] = rows
        print(f"{slug}: {len(rows)} кандидатов")
    with open("candidates.json", "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
    print(f"\nВсего: {sum(len(v) for v in out.values())} кандидатов -> candidates.json")


if __name__ == "__main__":
    main()
