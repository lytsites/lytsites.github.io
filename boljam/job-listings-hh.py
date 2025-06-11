import requests
import time
import csv
from collections import defaultdict
from datetime import datetime
import os
from tqdm import tqdm

BASE_URL = "https://api.hh.ru/vacancies"
params = {
    "area": 159,      # Казахстан
    "per_page": 100,
    "page": 0
}

headers = {
    "User-Agent": "Mozilla/5.0"
}

def parse_page(data):
    results = []
    items = data.get("items", [])
    for item in items:
        name = item.get("name")
        url = item.get("alternate_url")
        city = item.get("address", {}).get("city") if item.get("address") else "Не указано"
        if name and url:
            results.append({
                "name": name,
                "url": url,
                "city": city
            })
    return results

def main():
    all_data = []

    response = requests.get(BASE_URL, params=params, headers=headers)
    data = response.json()
    total_pages = data.get("pages", 1)

    # Обрабатываем первую страницу
    page_data = parse_page(data)
    all_data.extend(page_data)

    # Используем tqdm для оставшихся страниц
    for page in tqdm(range(1, total_pages), desc="Загрузка страниц"):
        params["page"] = page
        response = requests.get(BASE_URL, params=params, headers=headers)
        data = response.json()
        page_data = parse_page(data)
        if not page_data:
            break
        all_data.extend(page_data)
        time.sleep(0.25)

    # Группировка по (name, url, city)
    grouped = defaultdict(int)
    for item in all_data:
        key = (item["name"], item["url"], item["city"])
        grouped[key] += 1

    final_data = [
        {"name": name, "url": url, "city": city, "count": count}
        for (name, url, city), count in grouped.items()
    ]

    # Сортировка по убыванию count
    final_data.sort(key=lambda x: x["count"], reverse=True)

    folder = "./csv/hh"
    os.makedirs(folder, exist_ok=True)

    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"{folder}/parsed_data_hh_{date_str}.csv"
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "url", "city", "count"])
        writer.writeheader()
        writer.writerows(final_data)

    print("✅ Готово! Уникальных записей:", len(final_data))

if __name__ == "__main__":
    main()