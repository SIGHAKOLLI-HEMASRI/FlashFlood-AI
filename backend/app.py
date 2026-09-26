from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "flood_model.pkl"
)

model = joblib.load(MODEL_PATH)

FEATURES = [
    "rainfall_1h",
    "rainfall_3h",
    "rainfall_24h",
    "forecast_rainfall",
    "soil_moisture",
    "slope",
    "elevation",
    "historical_risk"
]

def get_risk_level(score):
    if score <= 30:
        return "LOW"
    elif score <= 55:
        return "MODERATE"
    elif score <= 75:
        return "HIGH"
    else:
        return "CRITICAL"

def get_warning_time(level):
    if level == "LOW":
        return "Monitoring"
    elif level == "MODERATE":
        return "60–120 minutes"
    elif level == "HIGH":
        return "30–60 minutes"
    else:
        return "10–30 minutes"

def get_action(level):
    if level == "LOW":
        return "Continue monitoring conditions."
    elif level == "MODERATE":
        return "Increase monitoring and alert local authorities."
    elif level == "HIGH":
        return "Prepare evacuation procedures and notify residents."
    else:
        return "Issue emergency warning and begin evacuation procedures."

@app.route("/")
def home():
    return jsonify({
        "system": "FlashGuard AI",
        "status": "online"
    })

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "model": "loaded"
    })

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    try:
        values = [float(data[feature]) for feature in FEATURES]
    except Exception:
        return jsonify({
            "error": "Missing or invalid input data"
        }), 400

    prediction = model.predict([values])[0]

    score = round(max(0, min(100, float(prediction))), 1)

    level = get_risk_level(score)

    return jsonify({
        "risk_score": score,
        "risk_level": level,
        "warning_time": get_warning_time(level),
        "action": get_action(level)
    })

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )