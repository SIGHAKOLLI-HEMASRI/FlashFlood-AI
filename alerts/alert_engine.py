from winotify import Notification
import json
import joblib
import os
import time
import winsound

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "models",
    "flood_model.pkl"
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "alerts",
    "local_data.json"
)
SOUND_PATH = r"D:\FlashFlood-AI\frontend\alerts\emergency_warning.wav"

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

model = joblib.load(MODEL_PATH)
previous_level = None


def get_risk_level(score):
    if score <= 30:
        return "LOW"
    elif score <= 55:
        return "MODERATE"
    elif score <= 75:
        return "HIGH"
    return "CRITICAL"


def play_emergency_siren(level):
    try:
        print()
        print("########################################")
        print("       EMERGENCY SIREN ACTIVATED")
        print("########################################")

        if not os.path.exists(SOUND_PATH):
            print("Siren file not found:")
            print(SOUND_PATH)
            return

        print("Playing:")
        print(SOUND_PATH)

        winsound.PlaySound(
            SOUND_PATH,
            winsound.SND_FILENAME
        )

        print("Emergency siren finished.")

    except Exception as error:
        print("Siren error:", error)


def send_notification(level, score):
    if level == "HIGH":
        title = "FLASHGUARD AI - HIGH FLOOD RISK"
        message = (
            f"Flood risk: {score}/100\n"
            "Prepare for possible evacuation.\n"
            "Follow official local instructions."
        )

    elif level == "CRITICAL":
        title = "FLASHGUARD AI - CRITICAL FLOOD EMERGENCY"
        message = (
            f"CRITICAL FLOOD RISK: {score}/100\n"
            "Emergency response may be required.\n"
            "Follow official evacuation instructions."
        )

    else:
        return

    try:
        notification = Notification(
            app_id="FlashGuard AI Emergency Alert System",
            title=title,
            msg=message,
            duration="long"
        )

        notification.show()

        print("Windows emergency notification sent.")

    except Exception as error:
        print("Notification error:", error)


def check_risk():
    with open(DATA_PATH, "r") as file:
        data = json.load(file)

    values = [
        float(data[feature])
        for feature in FEATURES
    ]

    prediction = model.predict([values])[0]

    score = round(
        max(
            0,
            min(
                100,
                float(prediction)
            )
        ),
        1
    )

    level = get_risk_level(score)

    print()
    print("==========================================")
    print("           FLASHGUARD AI")
    print("        OFFLINE RISK MONITOR")
    print("==========================================")
    print(f"Risk Score : {score}/100")
    print(f"Risk Level : {level}")
    print("==========================================")

    return level, score


def main():
    global previous_level

    print()
    print("==========================================")
    print("             FLASHGUARD AI")
    print("      OFFLINE EMERGENCY ALERT ENGINE")
    print("==========================================")
    print()
    print("Internet dependency   : NONE")
    print("Website dependency    : NONE")
    print("ML model              : LOADED")
    print("Local data            : ENABLED")
    print("Windows notification  : ENABLED")
    print("Emergency siren       : ENABLED")
    print()
    print("Offline monitoring started...")
    print("The system can operate without internet.")
    print()

    while True:
        try:
            level, score = check_risk()

            if level in ["HIGH", "CRITICAL"]:

                if level != previous_level:

                    print()
                    print("########################################")
                    print("       !!! FLOOD EMERGENCY !!!")
                    print("########################################")
                    print()
                    print(f"Risk Score : {score}/100")
                    print(f"Risk Level : {level}")
                    print()

                    send_notification(
                        level,
                        score
                    )

                    play_emergency_siren(
                        level
                    )

                    print()
                    print("Emergency alert delivered.")

                else:
                    print(
                        "Emergency condition continues."
                    )

            elif level == "MODERATE":
                print(
                    "Monitoring condition: MODERATE."
                )

            else:
                print(
                    "System condition: LOW."
                )

            previous_level = level

        except Exception as error:
            print()
            print("Monitoring error:")
            print(error)
            print()

        print(
            "Next automatic check in 60 seconds..."
        )

        time.sleep(60)


if __name__ == "__main__":
    main()