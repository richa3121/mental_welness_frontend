const data = JSON.parse(localStorage.getItem("dailyData"));
const reportDiv = document.getElementById("report");

if (!data) {
    reportDiv.innerHTML = "No data found.";
} else {
    reportDiv.innerHTML = `
    <p><b>Mood:</b> ${data.mood}</p>
    <p><b>Food:</b> ${data.food}</p>
    <p><b>Water:</b> ${data.water}</p>
    <p><b>Journal:</b> ${data.journal}</p>
  `;
}