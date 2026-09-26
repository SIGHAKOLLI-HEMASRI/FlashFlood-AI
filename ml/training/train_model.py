import pandas as pd
import joblib
import os

from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

dataset_path = os.path.join(
    BASE_DIR,
    "datasets",
    "flood_data.csv"
)

model_path = os.path.join(
    BASE_DIR,
    "models",
    "flood_model.pkl"
)

data = pd.read_csv(dataset_path)

features = [
    "rainfall_1h",
    "rainfall_3h",
    "rainfall_24h",
    "forecast_rainfall",
    "soil_moisture",
    "slope",
    "elevation",
    "historical_risk"
]

X = data[features]
y = data["risk_score"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

mae = mean_absolute_error(
    y_test,
    predictions
)

os.makedirs(
    os.path.dirname(model_path),
    exist_ok=True
)

joblib.dump(model, model_path)

print("--------------------------------")
print("FLASHGUARD AI")
print("--------------------------------")
print("Model trained successfully")
print("Mean Absolute Error:", round(mae, 2))
print("Model saved at:")
print(model_path)
print("--------------------------------")
