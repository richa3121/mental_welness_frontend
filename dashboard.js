// ---------- Mood Section ----------
function updateMood() {
    const slider = document.getElementById("moodSlider");
    const display = document.getElementById("moodDisplay");
    const emojiSpan = document.getElementById("moodEmoji");
    const body = document.body;

    const moods = {
        1: { emoji: "😢", text: "Very Sad", color: "#fde2e2" },
        2: { emoji: "🙁", text: "Sad", color: "#fcd5ce" },
        3: { emoji: "😐", text: "Calm", color: "#e0f7fa" },
        4: { emoji: "🙂", text: "Happy", color: "#d4f5d4" },
        5: { emoji: "😄", text: "Very Happy", color: "#fff7d6" }
    };

    const mood = moods[slider.value];
    display.innerText = mood.text;
    emojiSpan.innerText = mood.emoji;

    // Page background changes based on mood
    body.style.background = mood.color;

    updateStreak(slider.value);

    // Confetti for very happy mood
    if (slider.value == 5) {
        confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// ---------- Mood Streak ----------
function updateStreak(value) {
    let streak = parseInt(localStorage.getItem("streak") || 0);
    if (value >= 4) streak++;
    else streak = 0;
    localStorage.setItem("streak", streak);
    document.getElementById("streakProgress").style.width = Math.min(streak * 10, 100) + "%";
    document.getElementById("streakText").innerText = `Streak: ${streak} day(s)`;
}

// ---------- Journal Prompts ----------
function insertPrompt(text) {
    const journal = document.getElementById("journal");
    if (journal.value.length > 0) journal.value += "\n";
    journal.value += text;
    journal.focus();
}

// ---------- Water Tracker ----------
function incrementWater() {
    const waterInput = document.getElementById("water");
    waterInput.value = parseInt(waterInput.value) + 1;
    updateCharts(); // Refresh water chart
}

// ---------- Meditation Timer ----------
let meditationInterval;

function startMeditation() {
    clearInterval(meditationInterval);
    const circle = document.getElementById("meditationCircle");
    const timerDiv = document.getElementById("meditationTimer");
    let sec = 60;
    timerDiv.innerText = `Time left: ${sec}s`;
    circle.style.transform = "scale(1.5)";
    meditationInterval = setInterval(() => {
        sec--;
        timerDiv.innerText = `Time left: ${sec}s`;
        if (sec <= 0) {
            clearInterval(meditationInterval);
            circle.style.transform = "scale(1)";
            timerDiv.innerText = "Meditation Completed ✅";
        }
    }, 1000);
}

// ---------- Mood Calendar (fixed) ----------
function renderMoodCalendar() {
    const calendar = document.getElementById("moodCalendar");
    calendar.innerHTML = "";
    const monthDays = 30;

    // Load monthly data
    const monthlyData = JSON.parse(localStorage.getItem("monthlyData") || "{}");

    // Mapping moods to emojis
    const moodEmojis = {
        "Very Sad": "😢",
        "Sad": "🙁",
        "Calm": "😐",
        "Happy": "🙂",
        "Very Happy": "😄"
    };

    for (let i = 1; i <= monthDays; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("calendarDay");

        // Make every day visible
        dayDiv.style.background = "#e2e8f0"; // light gray circle
        dayDiv.style.display = "flex";
        dayDiv.style.alignItems = "center";
        dayDiv.style.justifyContent = "center";
        dayDiv.style.fontSize = "16px";

        // If mood recorded for this day, show emoji
        if (monthlyData[i] && monthlyData[i].mood) {
            dayDiv.innerText = moodEmojis[monthlyData[i].mood] || "😐";
            dayDiv.style.background = "#4c51bf"; // colored circle for recorded mood
            dayDiv.style.color = "#fff";
        }

        calendar.appendChild(dayDiv);
    }
}

// ---------- Achievements ----------
function renderAchievements() {
    const badges = document.getElementById("achievements");
    badges.innerHTML = "";
    const streak = parseInt(localStorage.getItem("streak") || 0);
    if (streak >= 7) badges.innerHTML += '<div class="badge">7-Day Streak 🏆</div>';
    if (streak >= 14) badges.innerHTML += '<div class="badge">2-Week Streak 🏆</div>';
    const journal = document.getElementById("journal").value;
    if (journal.length > 50) badges.innerHTML += '<div class="badge">Journaling 50+ chars ✍️</div>';
}

// ---------- Save Data ----------
function saveData() {
    const moodText = document.getElementById("moodDisplay").innerText;
    const water = document.getElementById("water").value;
    const journal = document.getElementById("journal").value;
    const today = new Date().getDate(); // Day of month (1-31)

    // Load existing monthly data
    let monthlyData = JSON.parse(localStorage.getItem("monthlyData") || "{}");

    // Save today’s entry
    monthlyData[today] = { mood: moodText, water, journal };
    localStorage.setItem("monthlyData", JSON.stringify(monthlyData));

    showToast();
    renderMoodCalendar();
    renderAchievements();
    updateCharts();
    if (moodText.includes("Very Sad")) showHelpline();
}

// ---------- Toast Notification ----------
function showToast() {
    const toast = document.getElementById("toast");
    toast.style.opacity = 1;
    setTimeout(() => { toast.style.opacity = 0; }, 2000);
}

// ---------- Helpline Modal ----------
function showHelpline() { document.getElementById("helplineModal").style.display = "block"; }

function closeModal() { document.getElementById("helplineModal").style.display = "none"; }

// ---------- Night Mode ----------
function toggleNightMode() { document.body.classList.toggle("night"); }

// ---------- Charts ----------
let moodChart, waterChart;

function updateCharts() {
    const monthlyData = JSON.parse(localStorage.getItem("monthlyData") || "{}");

    // Prepare arrays for 7 days (Mon-Sun)
    const moodValues = [];
    const waterValues = [];
    const moodMap = { "Very Sad": 1, "Sad": 2, "Calm": 3, "Happy": 4, "Very Happy": 5 };

    for (let i = 1; i <= 7; i++) {
        if (monthlyData[i]) {
            moodValues.push(moodMap[monthlyData[i].mood] || 3);
            waterValues.push(parseInt(monthlyData[i].water) || 0);
        } else {
            moodValues.push(3); // Default Calm
            waterValues.push(0);
        }
    }

    // Mood Chart
    const ctxMood = document.getElementById("moodChart").getContext("2d");
    if (moodChart) moodChart.destroy();
    moodChart = new Chart(ctxMood, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Mood",
                data: moodValues,
                borderColor: "#4c51bf",
                backgroundColor: "rgba(76,81,191,0.2)",
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } } }
    });

    // Water Chart
    const ctxWater = document.getElementById("waterChart").getContext("2d");
    if (waterChart) waterChart.destroy();
    waterChart = new Chart(ctxWater, {
        type: "bar",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                label: "Water (glasses)",
                data: waterValues,
                backgroundColor: "#a3bffa"
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
}

// ---------- Initial Render ----------
renderMoodCalendar();
renderAchievements();
updateCharts();
updateMood();