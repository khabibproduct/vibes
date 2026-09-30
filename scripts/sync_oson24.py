#!/usr/bin/env python3
"""Забирает актуальное меню LILU Drinks со страницы Oson24 и обновляет сайт.

Что делает:
  1. скачивает страницу заведения (по умолчанию https://oson24.tj/ru/institution/48);
  2. достаёт из неё категории, позиции, цены, размеры и данные о заведении;
  3. сохраняет фото напитков в lilu/img/menu/<id>.webp;
  4. пишет lilu/menu-data.js, из которого сайт строит меню.

Запуск из корня репозитория:  python3 scripts/sync_oson24.py
Нужен только Python 3, других пакетов не требуется.
"""
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

URL = "https://oson24.tj/ru/institution/48"
ROOT = Path(__file__).resolve().parent.parent / "lilu"
IMG_DIR = ROOT / "img" / "menu"
UA = {"User-Agent": "Mozilla/5.0"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as res:
        return res.read()


def flight_data(html):
    """Next.js кладёт данные страницы в self.__next_f.push([1, "..."])."""
    chunks = re.findall(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)</script>', html, re.S)
    return "".join(json.loads('"' + c + '"') for c in chunks)


def json_after(text, key):
    """Разбирает JSON-значение, которое идёт сразу после "key":"""
    start = text.index(f'"{key}":') + len(key) + 3
    value, _ = json.JSONDecoder().raw_decode(text[start:])
    return value


VOLUME_TAIL = re.compile(r"\s*(\d+(?:[.,]\d+)?)\s*(л|l|мл|ml)\.?\s*$", re.I)


def norm_volume(num, unit):
    unit = "мл" if unit.lower() in ("мл", "ml") else "л"
    return f"{num.replace('.', ',')} {unit}"


def split_name(name):
    """'Мохито клубничный 0,7л' -> ('Мохито клубничный', '0,7 л')."""
    m = VOLUME_TAIL.search(name)
    if not m:
        return name.strip(), ""
    return name[: m.start()].strip(), norm_volume(m.group(1), m.group(2))


def norm_option_label(title):
    m = re.fullmatch(r"\s*(\d+(?:[.,]\d+)?)\s*(л|l|мл|ml)\.?\s*", title, re.I)
    return norm_volume(m.group(1), m.group(2)) if m else title.strip()


def build_item(p):
    name, vol_in_name = split_name(p["name_ru"])
    sizes = []
    for opt in p.get("options") or []:
        for it in opt.get("items") or []:
            sizes.append({"label": norm_option_label(it["title_ru"]), "price": it["adding_price"]})
    sizes.sort(key=lambda s: s["price"])
    if not sizes:
        sizes = [{"label": vol_in_name, "price": p["price"] or p["price_display"]}]
    return {
        "id": p["id"],
        "name": name,
        "img": f"img/menu/{p['id']}.webp",
        "src": p["image"].replace("http://", "https://"),
        "sizes": sizes,
    }


def main():
    html = get(URL).decode("utf-8")
    flight = flight_data(html)

    categories_raw = json_after(flight, "category_set")

    def field(key, default=None):
        m = re.search(rf'"{key}":("(?:[^"\\]|\\.)*"|[^,}}]+)', flight)
        return json.loads(m.group(1)) if m else default

    name_match = re.search(r'"pinfl":"[^"]*","name":"((?:[^"\\]|\\.)*)"', flight)
    addr = json.JSONDecoder().raw_decode(flight[flight.index('"address":{') + len('"address":'):])[0]
    info = {
        "name": json.loads('"' + name_match.group(1) + '"') if name_match else "LILU Drinks",
        "phone": field("phone_number"),
        "open": (field("start_time") or "")[:5],
        "close": (field("end_time") or "")[:5],
        "deliveryFrom": field("min_delivery_time"),
        "deliveryTo": field("max_delivery_time"),
        "deliveryPrice": field("delivery_price"),
        "minOrder": field("min_order_amount"),
        "lat": addr.get("latitude"),
        "lng": addr.get("longitude"),
    }
    pm = json_after(flight, "payment_method")
    info["cashOnly"] = bool(pm.get("cash")) and not pm.get("card")

    menu_categories = []
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    used = set()
    for cat in categories_raw:
        items = [build_item(p) for p in cat["product_set"] if p.get("status") == "active"]
        if not items:
            continue
        menu_categories.append({"id": cat["id"], "ru": cat["name_ru"], "en": cat["name_en"], "items": items})

    for cat in menu_categories:
        for it in cat["items"]:
            target = IMG_DIR / f"{it['id']}.webp"
            used.add(target.name)
            if not target.exists():
                target.write_bytes(get(it["src"]))
            del it["src"]
    for old in IMG_DIR.glob("*.webp"):
        if old.name not in used:
            old.unlink()

    data = {
        "updated": date.today().isoformat(),
        "source": URL,
        "info": info,
        "categories": menu_categories,
    }
    out = ROOT / "menu-data.js"
    out.write_text(
        "// Создан скриптом scripts/sync_oson24.py — не правьте вручную, запустите скрипт заново.\n"
        "window.MENU = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
        encoding="utf-8",
    )
    n = sum(len(c["items"]) for c in menu_categories)
    print(f"Готово: {len(menu_categories)} категорий, {n} позиций → {out.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    sys.exit(main())
