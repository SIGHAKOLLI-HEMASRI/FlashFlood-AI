const locations = {

    munnar: {
        name: "Munnar, Kerala",
        rainfall_1h: 70,
        rainfall_3h: 150,
        rainfall_24h: 190,
        forecast_rainfall: 60,
        soil_moisture: 80,
        slope: 36,
        elevation: 1500,
        historical_risk: 75
    },

    wayanad: {
        name: "Wayanad, Kerala",
        rainfall_1h: 60,
        rainfall_3h: 130,
        rainfall_24h: 170,
        forecast_rainfall: 50,
        soil_moisture: 75,
        slope: 34,
        elevation: 1400,
        historical_risk: 65
    },

    darjeeling: {
        name: "Darjeeling, West Bengal",
        rainfall_1h: 35,
        rainfall_3h: 78,
        rainfall_24h: 110,
        forecast_rainfall: 30,
        soil_moisture: 58,
        slope: 28,
        elevation: 1100,
        historical_risk: 42
    },

    shimla: {
        name: "Shimla, Himachal Pradesh",
        rainfall_1h: 22,
        rainfall_3h: 48,
        rainfall_24h: 70,
        forecast_rainfall: 18,
        soil_moisture: 45,
        slope: 20,
        elevation: 900,
        historical_risk: 25
    },

    ooty: {
        name: "Ooty, Tamil Nadu",
        rainfall_1h: 8,
        rainfall_3h: 18,
        rainfall_24h: 30,
        forecast_rainfall: 8,
        soil_moisture: 25,
        slope: 10,
        elevation: 600,
        historical_risk: 10
    }

};


/* =========================
   RISK HISTORY
========================= */

let riskHistory = [];


/* =========================
   MAIN AI PREDICTION
========================= */

async function runLocationPrediction() {

    


    const locationSelect =
        document.getElementById("locationSelect");

    if (!locationSelect) {
        return;
    }

    const location =
        locationSelect.value;

    const data =
        locations[location];

    if (!data) {
        alert("Please select a valid location.");
        return;
    }

    const selectedLocation =
        document.getElementById("selectedLocation");

    if (selectedLocation) {
        selectedLocation.textContent =
            data.name;
    }


    try {

        const response = await fetch(
            "http:///predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Prediction failed"
            );

        }


        /* Update dashboard */

        updateDashboard(
            result,
            data
        );


        /* Update AI prediction */

        updatePredictionPage(
            result
        );


        /* Explain the prediction */

        updateRiskReasons(
            result,
            data
        );


        /* Update community alert */

        updateCommunityAlert(
            result
        );


        /* Save prediction */

        saveRiskHistory(
            result,
            data
        );


        /*
         * EARLY WARNING SYSTEM
         *
         * HIGH = early warning
         * CRITICAL = emergency warning
         */

        if (
    result.risk_level === "HIGH" ||
    result.risk_level === "CRITICAL"
) {

    playEmergencySound(
        result.risk_level
    );

    showEmergencyAlert(
        data,
        result
    );

}

    }


    catch (error) {

        console.error(
            "Prediction error:",
            error
        );

        alert(
            "Unable to connect to FlashGuard AI backend.\n\n" +
            "Make sure Flask is running:\n\n" +
            "python backend\\app.py"
        );

    }

}


/* =========================
   DASHBOARD UPDATE
========================= */

function updateDashboard(
    result,
    data
) {

    const score =
        document.getElementById(
            "riskScore"
        );

    if (score) {

        score.textContent =
            result.risk_score;

    }


    const level =
        document.getElementById(
            "riskLevel"
        );

    if (level) {

        level.textContent =
            result.risk_level;

    }


    const warning =
        document.getElementById(
            "warningWindow"
        );

    if (warning) {

        warning.textContent =
            result.warning_time;

    }


    const action =
        document.getElementById(
            "riskAction"
        );

    if (action) {

        action.textContent =
            result.action;

    }

}


/* =========================
   AI RESULT UPDATE
========================= */

function updatePredictionPage(
    result
) {

    const score =
        document.getElementById(
            "predictionScore"
        );

    const level =
        document.getElementById(
            "predictionLevel"
        );

    const action =
        document.getElementById(
            "predictionAction"
        );

    const warning =
        document.getElementById(
            "predictionWarning"
        );


    if (score) {

        score.textContent =
            result.risk_score;

    }


    if (level) {

        level.textContent =
            result.risk_level;

    }


    if (action) {

        action.textContent =
            result.action;

    }


    if (warning) {

        warning.textContent =
            result.warning_time;

    }

}


/* =========================
   RISK EXPLANATION
========================= */

function updateRiskReasons(
    result,
    data
) {

    const container =
        document.getElementById(
            "riskReasons"
        );


    if (!container) {
        return;
    }


    const reasons = [];


    if (data.rainfall_1h >= 50) {

        reasons.push(
            "Heavy short-duration rainfall is increasing flood risk."
        );

    }

    else if (data.rainfall_1h >= 25) {

        reasons.push(
            "Moderate rainfall intensity is contributing to risk."
        );

    }


    if (data.rainfall_3h >= 100) {

        reasons.push(
            "High accumulated rainfall is increasing surface runoff."
        );

    }


    if (data.rainfall_24h >= 150) {

        reasons.push(
            "High 24-hour rainfall indicates substantial water accumulation."
        );

    }


    if (data.forecast_rainfall >= 40) {

        reasons.push(
            "Additional rainfall is expected."
        );

    }


    if (data.soil_moisture >= 70) {

        reasons.push(
            "High soil moisture indicates reduced infiltration capacity."
        );

    }


    if (data.slope >= 30) {

        reasons.push(
            "Steep terrain can accelerate surface runoff."
        );

    }


    if (data.historical_risk >= 60) {

        reasons.push(
            "Historical flood-risk characteristics are elevated."
        );

    }


    if (reasons.length === 0) {

        reasons.push(
            "Current environmental conditions are relatively stable."
        );

    }


    container.innerHTML = "";


    reasons.forEach(
        function(reason) {

            const item =
                document.createElement(
                    "div"
                );


            item.style.padding =
                "9px 0";


            item.style.borderBottom =
                "1px solid #1d3047";


            item.style.color =
                "#8fa5bd";


            item.textContent =
                "✓ " + reason;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================
   COMMUNITY ALERT
========================= */

function updateCommunityAlert(
    result
) {

    const status =
        document.getElementById(
            "communityAlertStatus"
        );


    if (!status) {
        return;
    }


    if (result.risk_level === "CRITICAL") {

        status.textContent =
            "EMERGENCY ALERT ACTIVE";

    }

    else if (result.risk_level === "HIGH") {

        status.textContent =
            "EARLY WARNING ACTIVE";

    }

    else if (result.risk_level === "MODERATE") {

        status.textContent =
            "MONITORING ALERT";

    }

    else {

        status.textContent =
            "NO EMERGENCY ALERT";

    }

}


/* =========================
   EARLY WARNING / EMERGENCY
========================= */
let emergencyAudio = null;

function prepareEmergencyAudio() {
    if (emergencyAudio) {
        return;
    }

    emergencyAudio = new Audio(
        "/alerts/emergency_warning.wav"
    );

    emergencyAudio.preload = "auto";
    emergencyAudio.volume = 1.0;
    emergencyAudio.muted = true;

    emergencyAudio.play()
        .then(function() {
            emergencyAudio.pause();
            emergencyAudio.currentTime = 0;
            emergencyAudio.muted = false;
        })
        .catch(function(error) {
            console.log(
                "Audio preparation blocked:",
                error
            );
        });
}

function playEmergencySound(level) {

    level = String(level).toUpperCase();

    if (
        level !== "HIGH" &&
        level !== "CRITICAL"
    ) {
        return;
    }

    if (!emergencyAudio) {
        emergencyAudio = new Audio(
            "/alerts/emergency_warning.wav"
        );
    }

    emergencyAudio.pause();
    emergencyAudio.currentTime = 0;
    emergencyAudio.volume = 1.0;
    emergencyAudio.muted = false;

    emergencyAudio.play()
        .then(function() {
            console.log(
                "🚨 EMERGENCY SIREN PLAYING"
            );
        })
        .catch(function(error) {
            console.error(
                "Siren playback failed:",
                error
            );
        });
}
function showEmergencyAlert(
    data,
    result
) {

    const oldAlert =
        document.getElementById(
            "emergencyAlert"
        );


    if (oldAlert) {
        oldAlert.remove();
    }


    const isCritical =
        result.risk_level === "CRITICAL";


    const title =
        isCritical
            ? "CRITICAL FLOOD RISK DETECTED"
            : "HIGH FLOOD RISK — EARLY WARNING";


    const alertLabel =
        isCritical
            ? "FLASHGUARD AI EMERGENCY WARNING"
            : "FLASHGUARD AI EARLY WARNING";


    const alertMessage =
        isCritical
            ? "Immediate emergency response may be required."
            : "Early warning issued. Prepare evacuation procedures and continue monitoring conditions.";


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "emergencyAlert";


    overlay.style.position =
        "fixed";

    overlay.style.top =
        "0";

    overlay.style.left =
        "0";

    overlay.style.width =
        "100%";

    overlay.style.height =
        "100%";

    overlay.style.background =
        "rgba(2, 8, 15, 0.94)";

    overlay.style.zIndex =
        "99999";

    overlay.style.display =
        "flex";

    overlay.style.alignItems =
        "center";

    overlay.style.justifyContent =
        "center";

    overlay.style.padding =
        "25px";

    overlay.style.overflowY =
        "auto";


    const box =
        document.createElement(
            "div"
        );


    box.style.width =
        "min(650px, 100%)";

    box.style.background =
        "#0b1827";

    box.style.border =
        isCritical
            ? "2px solid #e44d5c"
            : "2px solid #f0a83c";

    box.style.borderRadius =
        "18px";

    box.style.padding =
        "35px";

    box.style.boxShadow =
        isCritical
            ? "0 0 60px rgba(228,77,92,.25)"
            : "0 0 60px rgba(240,168,60,.20)";

    box.style.textAlign =
        "center";


    box.innerHTML = `

        <div style="
            font-size:48px;
            margin-bottom:15px;
        ">
            ${isCritical ? "🚨" : "⚠️"}
        </div>


        <div style="
            color:${isCritical ? "#e44d5c" : "#f0a83c"};
            font-size:13px;
            font-weight:800;
            letter-spacing:2px;
        ">
            ${alertLabel}
        </div>


        <h1 style="
            margin:12px 0;
            font-size:30px;
            color:#ffffff;
        ">
            ${title}
        </h1>


        <div style="
            color:#8fa5bd;
            font-size:15px;
            margin-bottom:25px;
        ">
            ${data.name}
        </div>


        <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
            margin-bottom:25px;
        ">

            <div style="
                background:#101f33;
                border:1px solid #263c54;
                border-radius:10px;
                padding:18px;
            ">

                <div style="
                    color:#71869e;
                    font-size:10px;
                    letter-spacing:1px;
                ">
                    RISK SCORE
                </div>

                <strong style="
                    display:block;
                    margin-top:8px;
                    font-size:28px;
                    color:#ffffff;
                ">
                    ${result.risk_score}/100
                </strong>

            </div>


            <div style="
                background:#101f33;
                border:1px solid #263c54;
                border-radius:10px;
                padding:18px;
            ">

                <div style="
                    color:#71869e;
                    font-size:10px;
                    letter-spacing:1px;
                ">
                    WARNING WINDOW
                </div>

                <strong style="
                    display:block;
                    margin-top:8px;
                    font-size:20px;
                    color:#ffffff;
                ">
                    ${result.warning_time}
                </strong>

            </div>

        </div>


        <div style="
            background:${isCritical ? "#24151a" : "#241f15"};
            border:1px solid ${isCritical ? "#61313a" : "#604b27"};
            border-radius:10px;
            padding:18px;
            text-align:left;
            margin-bottom:18px;
        ">

            <div style="
                color:${isCritical ? "#e44d5c" : "#f0a83c"};
                font-size:11px;
                font-weight:700;
                letter-spacing:1px;
                margin-bottom:8px;
            ">
                RECOMMENDED ACTION
            </div>

            <div style="
                color:#ffffff;
                line-height:1.6;
            ">
                ${result.action}
            </div>

        </div>


        <div style="
            color:#8fa5bd;
            font-size:13px;
            line-height:1.6;
            margin-bottom:22px;
        ">
            ${alertMessage}
        </div>


        <div style="
            color:#71869e;
            font-size:11px;
            line-height:1.5;
            margin-bottom:20px;
        ">
            Prototype alert demonstration.
            Real-world emergency decisions should be
            verified with official authorities.
        </div>


        <button
            onclick="closeEmergencyAlert()"
            style="
                width:100%;
                padding:14px;
                border:0;
                border-radius:9px;
                background:${isCritical ? "#e44d5c" : "#c8892f"};
                color:white;
                font-weight:700;
                cursor:pointer;
                font-size:13px;
            "
        >
            ACKNOWLEDGE ALERT
        </button>

    `;


    overlay.appendChild(
        box
    );


    document.body.appendChild(
        overlay
    );

}


/* =========================
   CLOSE ALERT
========================= */

function closeEmergencyAlert() {

    const alert =
        document.getElementById(
            "emergencyAlert"
        );


    if (alert) {

        alert.remove();

    }

}


/* =========================
   RISK HISTORY
========================= */

function saveRiskHistory(
    result,
    data
) {

    const record = {

        location:
            data.name,

        score:
            result.risk_score,

        level:
            result.risk_level,

        time:
            new Date()
                .toLocaleTimeString()

    };


    riskHistory.push(
        record
    );


    if (riskHistory.length > 10) {

        riskHistory.shift();

    }


    updateRiskTrend();

    updateRiskHistoryDisplay();

}


/* =========================
   RISK TREND
========================= */

function updateRiskTrend() {

    if (riskHistory.length < 2) {

        return;

    }


    const current =
        riskHistory[
            riskHistory.length - 1
        ].score;


    const previous =
        riskHistory[
            riskHistory.length - 2
        ].score;


    let trendText;


    if (current > previous) {

        trendText =
            "RISK INCREASING ↑";

    }

    else if (current < previous) {

        trendText =
            "RISK DECREASING ↓";

    }

    else {

        trendText =
            "RISK STABLE →";

    }


    console.log(
        "FlashGuard AI:",
        trendText
    );


    const trendElement =
        document.getElementById(
            "riskTrendStatus"
        );


    if (trendElement) {

        trendElement.textContent =
            trendText;

    }

}


/* =========================
   RISK HISTORY DISPLAY
========================= */

function updateRiskHistoryDisplay() {

    const historyContainer =
        document.getElementById(
            "riskHistoryList"
        );


    if (!historyContainer) {

        return;

    }


    historyContainer.innerHTML = "";


    const latest =
        [...riskHistory]
            .reverse();


    latest.forEach(
        function(item) {

            const row =
                document.createElement(
                    "div"
                );


            row.style.display =
                "flex";

            row.style.justifyContent =
                "space-between";

            row.style.alignItems =
                "center";

            row.style.padding =
                "12px 0";

            row.style.borderBottom =
                "1px solid #1d3047";


            row.innerHTML = `

                <div>

                    <strong style="
                        color:#eef6ff;
                        font-size:13px;
                    ">
                        ${item.location}
                    </strong>

                    <div style="
                        color:#71869e;
                        font-size:10px;
                        margin-top:4px;
                    ">
                        ${item.time}
                    </div>

                </div>


                <div style="
                    text-align:right;
                ">

                    <strong style="
                        color:#eef6ff;
                        font-size:16px;
                    ">
                        ${item.score}/100
                    </strong>

                    <div style="
                        color:#8fa5bd;
                        font-size:10px;
                        margin-top:4px;
                    ">
                        ${item.level}
                    </div>

                </div>

            `;


            historyContainer.appendChild(
                row
            );

        }
    );

}


/* =========================
   NAVIGATION
========================= */

function showPage(
    pageId
) {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        function(page) {

            page.style.display =
                "none";

        }
    );


    const target =
        document.getElementById(
            pageId
        );


    if (target) {

        target.style.display =
            "block";

    }

}


/* =========================
   STARTUP
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "FlashGuard AI initialized."
        );

    }
);