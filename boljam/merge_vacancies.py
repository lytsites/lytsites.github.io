import csv
import os
import json
import subprocess
from datetime import datetime
from tqdm import tqdm
from sentence_transformers import SentenceTransformer, util

# Пути
date_str = datetime.now().strftime("%Y-%m-%d")
enbek_file = f"./csv/enbek/parsed_data_enbek_{date_str}.csv"
hh_file = f"./csv/hh/parsed_data_hh_{date_str}.csv"
keywords_file = "keywords.json"

# Проверка наличия CSV
if not os.path.exists(enbek_file):
    subprocess.run(["python", "job-listings-enbek.py"], check=True)
if not os.path.exists(hh_file):
    subprocess.run(["python", "job-listings-hh.py"], check=True)

# Загрузка модели
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Загрузка ключевых слов
with open(keywords_file, encoding='utf-8') as f:
    keyword_map = json.load(f)

# Извлечение специальностей из ключей
specialties = list(keyword_map.keys())
specialty_embeddings = model.encode(specialties, convert_to_tensor=True)

# Создание обратной карты: ключевое слово → специальность
keyword_to_spec = {}
for spec, keywords in keyword_map.items():
    for keyword in keywords:
        keyword_to_spec[keyword.lower()] = spec

# Структура: specialty → {count, vacancies}
spec_data = {spec: {"count": 0, "vacancies": []} for spec in specialties}
spec_data["Не определено"] = {"count": 0, "vacancies": []}

# Функция классификации
def classify(name):
    name_lower = name.lower()
    for keyword, spec in keyword_to_spec.items():
        if keyword in name_lower:
            return spec
    # Модельная классификация
    emb = model.encode(name, convert_to_tensor=True)
    similarities = util.pytorch_cos_sim(emb, specialty_embeddings)[0]
    best_idx = similarities.argmax().item()
    return specialties[best_idx]

# Обработка файла
def process_file(filename):
    with open(filename, encoding="utf-8") as f:
        reader = list(csv.DictReader(f))
        for row in tqdm(reader, desc=f"Обработка {filename}"):
            name = row["name"]
            url = row.get("url", "")
            city = row.get("city", "Не указано")
            count = int(row.get("count", 1))
            spec = classify(name)
            if spec not in spec_data:
                spec = "Не определено"
            spec_data[spec]["count"] += count
            spec_data[spec]["vacancies"].append({
                "name": name,
                "city": city,
                "url": url
            })

# Обработка файлов
process_file(enbek_file)
process_file(hh_file)

# Сортировка
spec_data = {k: v for k, v in sorted(spec_data.items(), key=lambda x: -x[1]["count"])}

# Сохранение результата
os.makedirs("./json", exist_ok=True)
output_path = f"./json/grouped_by_specialty_{date_str}.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(spec_data, f, ensure_ascii=False, indent=2)

print(f"✅ JSON сохранён: {output_path}")

# Обновление index.json
index_path = "./json/index.json"

# Загружаем или создаём index.json
if os.path.exists(index_path):
    with open(index_path, "r", encoding="utf-8") as f:
        index_data = json.load(f)
else:
    index_data = {"all": []}

file_name = os.path.basename(output_path)
if file_name not in index_data["all"]:
    index_data["all"].append(file_name)

index_data["latest"] = file_name

with open(index_path, "w", encoding="utf-8") as f:
    json.dump(index_data, f, ensure_ascii=False, indent=2)

print(f"📌 index.json обновлён: {index_path}")