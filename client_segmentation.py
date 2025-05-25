import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import warnings

warnings.filterwarnings("ignore")

df = pd.read_parquet('dataset.parquet')

agg = df.groupby('card_id').agg(
    num_transactions=('transaction_id', 'count'),
    total_spent=('transaction_amount_kzt', 'sum'),
    avg_transaction=('transaction_amount_kzt', 'mean'),
    std_transaction=('transaction_amount_kzt', 'std'),
    unique_mcc=('merchant_mcc', pd.Series.nunique),
    unique_countries=('acquirer_country_iso', pd.Series.nunique),
    unique_cities=('merchant_city', pd.Series.nunique),
    pos_ratio=('transaction_type', lambda x: (x == 'POS').mean()),
    atm_ratio=('transaction_type', lambda x: (x == 'ATM_WITHDRAWAL').mean()),
    p2p_ratio=('transaction_type', lambda x: (x == 'P2P').mean()),
    contactless_ratio=('pos_entry_mode', lambda x: (x == 'Contactless').mean()),
    applepay_ratio=('wallet_type', lambda x: (x == 'Apple Pay').mean()),
    googlepay_ratio=('wallet_type', lambda x: (x == 'Google Pay').mean()),
    samsungpay_ratio=('wallet_type', lambda x: (x == 'Samsung Pay').mean()),
    foreign_txn_ratio=('transaction_currency', lambda x: (x != 'KZT').mean())
).fillna(0).reset_index()


features = agg.drop(columns=['card_id'])
scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)


with open("clusters.txt", "r") as f:
    value = int(f.read())

kmeans = KMeans(n_clusters=value, random_state=42, n_init='auto')
kmeans.fit(X_scaled)
agg['cluster'] = kmeans.labels_


def describe_cluster(row):
    if row['applepay_ratio'] > 0.2:
        return 'Пользователи Apple Pay'
    elif row['googlepay_ratio'] > 0.2:
        return 'Пользователи Google Pay'
    elif row['atm_ratio'] > 0.4:
        return 'Часто снимают наличные'
    elif row['contactless_ratio'] > 0.4:
        return 'Бесконтактные пользователи'
    elif row['num_transactions'] > 10000 and row['avg_transaction'] < 20000:
        return 'Часто тратят по мелочи'
    elif row['avg_transaction'] > 30000:
        return 'Редко, но крупно тратят'
    else:
        return 'Обычные пользователи'

agg['описание_кластера'] = agg.apply(describe_cluster, axis=1)
cluster_names = {
    0: "Обычные пользователи с низкой активностью",
    1: "Активные пользователи с мобильными кошельками",
    2: "Обычные пользователи с высокой активностью",
    3: "Премиум пользователи"
}
agg['cluster_name'] = agg['cluster'].map(cluster_names)
recommendations = {
    "Обычные пользователи с низкой активностью": "Предлагать программы лояльности и обучать пользованию безналичными платежами.",
    "Активные пользователи с мобильными кошельками": "Акцент на безопасность и новые сервисы мобильных платежей.",
    "Обычные пользователи с высокой активностью": "Промо-акции и бонусы за активное использование карт.",
    "Премиум пользователи": "Персональные предложения кредитных и страховых продуктов."
}

for cluster, name in cluster_names.items():
    count = agg[agg['cluster'] == cluster].shape[0]
    print(f"### Сегмент: {name}")
    print(f"Количество клиентов: {count}")
    print(f"Рекомендации: {recommendations[name]}\n")

agg[['card_id', 'cluster_name']].to_csv('clients_with_segments.csv', index=False)
print("Файл clients_with_segments.csv успешно сохранён.")

report = agg.groupby('описание_кластера').agg(
    кол_клиентов=('card_id', 'count'),
    ср_транзакций=('num_transactions', 'mean'),
    всего_потрачено=('total_spent', 'sum'),
    ср_чек=('avg_transaction', 'mean'),
    бесконтактные=('contactless_ratio', 'mean'),
    applepay=('applepay_ratio', 'mean'),
    снятие_наличных=('atm_ratio', 'mean'),
    p2p=('p2p_ratio', 'mean'),
    зарубежные=('foreign_txn_ratio', 'mean')
).round(2).reset_index()

for _, row in report.iterrows():
    print(f"### {row['описание_кластера']}")
    print(f"Количество клиентов: {int(row['кол_клиентов'])}")
    print(f"- Среднее число транзакций: {int(row['ср_транзакций'])}")
    print(f"- Общие траты: {int(row['всего_потрачено']):,} KZT")
    print(f"- Средний чек: {int(row['ср_чек']):,} KZT")
    print(f"- Бесконтактные платежи: {row['бесконтактные']}")
    print(f"- Apple Pay: {row['applepay']}")
    print(f"- Снятие наличных: {row['снятие_наличных']}")
    print(f"- P2P переводы: {row['p2p']}")
    print(f"- Транзакции за границей: {row['зарубежные']}")
    print()

pca = PCA(n_components=2)
components = pca.fit_transform(X_scaled)
agg['pca1'] = components[:, 0]
agg['pca2'] = components[:, 1]

plt.figure(figsize=(10, 7))
sns.scatterplot(
    data=agg,
    x='pca1',
    y='pca2',
    hue='описание_кластера',
    palette='tab10',
    s=50
)
plt.title('Кластеры клиентов по поведению')
plt.xlabel('PCA компонент 1')
plt.ylabel('PCA компонент 2')
plt.legend(title='Тип клиента', bbox_to_anchor=(1.05, 1), loc='upper left')
plt.grid(True)
plt.tight_layout()
plt.show()