import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
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

K = range(2, 21)
silhouette_scores = []

for k in K:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)
    score = silhouette_score(X_scaled, labels)
    silhouette_scores.append(score)

optimal_k = K[silhouette_scores.index(max(silhouette_scores))]

print(f"Оптимальное количество кластеров: {optimal_k}. Можете закрыть программу!")
with open("clusters.txt", "w") as f:
    f.write(str(optimal_k))