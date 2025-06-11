import requests
from bs4 import BeautifulSoup
import csv
from collections import defaultdict
from datetime import datetime
import os
import re
from tqdm import tqdm

BASE_URL = "https://enbek.kz/ru/search/vacancy?except[subsidized]=subsidized&page={}"
START_URL = BASE_URL.format(1)

headers = {
    "User-Agent": "Mozilla/5.0"
}

def get_max_page(soup):
    pagination = soup.select("li.page")
    return int(pagination[-1].text.strip()) if pagination else 1

def extract_city(location_text):
    # Пытаемся найти "г." или "с." с последующим названием
    match = re.search(r"(г\.|с\.)\s?([А-Яа-яЁёA-Za-z\-]+)", location_text)
    if match:
        return match.group(2)
    # Если ничего не найдено, возможно, название населённого пункта — последнее слово
    parts = location_text.split(",")
    if parts:
        return parts[-1].strip()
    return "Не указано"

def parse_page(soup):
    results = []
    items = soup.select("div.item-list")
    for item in items:
        # Название вакансии
        name = item.select_one("a.stretched")
        name_text = name.text.strip()

        # Ссылка
        link_elem = item.select_one("a.stretched")
        url = "https://enbek.kz" + link_elem["href"] if link_elem and link_elem.has_attr("href") else None

        # Город
        location_elem = item.select_one("li.location")
        location_text = location_elem.text.strip() if location_elem else ""
        city = extract_city(location_text)

        if name_text and url:
            results.append({
                "name": name_text,
                "url": url,
                "city": city
            })
    return results

def main():
    all_data = []

    response = requests.get(START_URL, headers=headers)
    soup = BeautifulSoup(response.text, "lxml")

    max_page = 100
    # max_page = get_max_page(soup)

    for page in tqdm(range(1, max_page + 1), desc="Загрузка страниц"):
        url = BASE_URL.format(page)
        resp = requests.get(url, headers=headers)
        page_soup = BeautifulSoup(resp.text, "lxml")
        data = parse_page(page_soup)
        all_data.extend(data)

    # Группировка по (name, url, city)
    grouped = defaultdict(int)
    for item in all_data:
        key = (item["name"], item["url"], item["city"])
        grouped[key] += 1

    final_data = [
        {"name": name, "url": url, "city": city, "count": count}
        for (name, url, city), count in grouped.items()
    ]

    final_data.sort(key=lambda x: x["count"], reverse=True)

    folder = "./csv/enbek"
    os.makedirs(folder, exist_ok=True)

    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"{folder}/parsed_data_enbek_{date_str}.csv"
    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "url", "city", "count"])
        writer.writeheader()
        writer.writerows(final_data)

    print("✅ Готово! Уникальных записей:", len(final_data))

if __name__ == "__main__":
    main()
