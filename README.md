## 💡 Команда HEXAGON

Этот проект выполняет кластеризацию клиентов на основе данных из `dataset.parquet` и сохраняет результат в `clients_with_segments.csv`, который можно открыть в Excel.

## 📁 Состав проекта

```
/
├── find_optimal_clusters.py       # Шаг 1: Поиск оптимального количества кластеров
├── client_segmentation.py         # Шаг 2: Сегментация клиентов по кластерам
├── dataset.parquet                # Входной датасет
├── DejaVuSans.ttf                 # Шрифт для визуализации
├── requirements.txt               # Список зависимостей
└── clients_with_segments.csv      # Выходной CSV-файл
```

## 📦 Установка и запуск

### 1. Создайте и активируйте виртуальное окружение (рекомендуется)

**Windows**:
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux**:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Установите зависимости

```bash
pip install -r requirements.txt
```

### 3. Запустите скрипты в следующем порядке

```bash
python find_optimal_clusters.py
python client_segmentation.py
```

## 📤 Результат

После выполнения скриптов в директории появится файл:

```
clients_with_segments.csv
```

Его можно открыть в Excel. В файле содержатся сегментированные данные клиентов.

## 📌 Примечания

- Убедитесь, что файл `dataset.parquet` и шрифт `DejaVuSans.ttf` находятся в той же папке, где запускаются скрипты.
---

## 💡 Команда HEXAGON