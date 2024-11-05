let chartInstance;

// Formátování čísla s měnou Kč
function formatNumberWithCurrency(value) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("CZK", "Kč");
}

// Vyčištění vstupní hodnoty pro čisté číslo
function cleanInputValue(input) {
  return input.value.replace(/\s+Kč/g, "").replace(/\s/g, "");
}

// Aktualizace vstupní hodnoty s formátovanou měnou
function updateInputValue(input, value) {
  input.value = formatNumberWithCurrency(Math.round(value));
}

// Výpočet budoucí hodnoty investice
function calculateFutureValue(initial, monthly, years, rate) {
  const months = years * 12;
  const monthlyRate = rate / 12;
  let futureValue = initial * Math.pow(1 + monthlyRate, months);

  for (let i = 1; i <= months; i++) {
    futureValue += monthly * Math.pow(1 + monthlyRate, months - i);
  }

  return futureValue;
}

// Aktualizace a vykreslení grafu
function calculateAndUpdateChart() {
  const initial = parseInt(cleanInputValue(document.getElementById("initial")));
  const monthly = parseInt(cleanInputValue(document.getElementById("monthly")));
  const years = parseFloat(document.getElementById("years").value);
  const rate = 0.06;

  const futureValue = calculateFutureValue(initial, monthly, years, rate);
  document.getElementById("futureValue").innerText =
    formatNumberWithCurrency(futureValue);

  const czechMonths = [
    "Leden",
    "Únor",
    "Březen",
    "Duben",
    "Květen",
    "Červen",
    "Červenec",
    "Srpen",
    "Září",
    "Říjen",
    "Listopad",
    "Prosinec",
  ];

  let labels, investiceData, zhodnoceniData;
  if (years === 1) {
    labels = czechMonths;
    investiceData = Array.from(
      { length: 12 },
      (_, i) => initial + monthly * (i + 1),
    );
    zhodnoceniData = Array.from({ length: 12 }, (_, i) =>
      calculateFutureValue(initial, monthly, (i + 1) / 12, rate),
    );
  } else {
    labels = Array.from({ length: years }, (_, i) => 2024 + i);
    investiceData = Array.from(
      { length: years },
      (_, i) => initial + monthly * 12 * (i + 1),
    );
    zhodnoceniData = Array.from({ length: years }, (_, i) =>
      calculateFutureValue(initial, monthly, i + 1, rate),
    );
  }

  const ctx = document.getElementById("investmentChart").getContext("2d");
  const gradientInvestice = ctx.createLinearGradient(0, 0, 800, 100);
  gradientInvestice.addColorStop(0.1895, "#D4C8BC");
  gradientInvestice.addColorStop(0.8249, "#B8AC9C");
  const gradientZhodnoceni = ctx.createLinearGradient(400, 0, 0, 400); // Upravené souřadnice pro přibližný úhel 218°
  gradientZhodnoceni.addColorStop(0.1136, "#331E37"); // 11.36%
  gradientZhodnoceni.addColorStop(0.7815, "#6C4A71"); // 78.15%

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Investice",
        data: investiceData,
        backgroundColor: gradientInvestice,

        fill: true,
        tension: 0.4,
      },
      {
        label: "Zhodnocení",
        data: zhodnoceniData,
        backgroundColor: gradientZhodnoceni,

        fill: true,
        tension: 0.4,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            stepSize: years === 1 ? 1 : 5,
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          position: "right",
          grid: { display: true, color: "#ddd" },
          ticks: {
            stepSize: 100000,
            callback: function (value) {
              return value.toLocaleString("cs-CZ", {
                style: "currency",
                currency: "CZK",
                minimumFractionDigits: 0,
              });
            },
          },
        },
      },
      elements: { point: { radius: years === 1 ? 3 : 0 } },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            usePointStyle: true,
            color: "#4e3a65",
            font: { family: "Manrope", size: 14 },
            padding: 37,
            textAlign: "center",
          },
        },
        tooltip: { enabled: true },
      },
    },
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, config);
}

// Obsluhy událostí pro vstupy a tlačítka
document
  .getElementById("initial-decrease")
  .addEventListener("click", function () {
    const input = document.getElementById("initial");
    let value = parseInt(cleanInputValue(input));
    value -= 5000;
    value = value < 500 ? 500 : value;
    updateInputValue(input, value);
    document.getElementById("error-message").style.display =
      value === 500 ? "block" : "none";
    calculateAndUpdateChart();
  });

document
  .getElementById("initial-increase")
  .addEventListener("click", function () {
    const input = document.getElementById("initial");
    let value = parseInt(cleanInputValue(input));
    value += 5000;
    updateInputValue(input, value);
    document.getElementById("error-message").style.display = "none";
    calculateAndUpdateChart();
  });

document
  .getElementById("monthly-increase")
  .addEventListener("click", function () {
    const input = document.getElementById("monthly");
    let value = parseInt(cleanInputValue(input));
    value += 1000;
    updateInputValue(input, value);
    showInvestmentMessage();
    calculateAndUpdateChart();
  });

document
  .getElementById("monthly-decrease")
  .addEventListener("click", function () {
    const input = document.getElementById("monthly");
    let value = parseInt(cleanInputValue(input));
    value = Math.max(value - 1000, 0);
    updateInputValue(input, value);
    showInvestmentMessage();
    calculateAndUpdateChart();
  });

// Kontrola minimální hodnoty pro počáteční vklad
function validateMinValue() {
  const input = document.getElementById("initial");
  const errorMessage = document.getElementById("error-message");
  const minValue = 1000;
  const numericValue = parseInt(cleanInputValue(input));

  // Zobrazí chybovou hlášku, pokud hodnota klesne pod 1000 Kč
  if (numericValue < minValue || isNaN(numericValue)) {
    errorMessage.style.display = "block";
  } else {
    errorMessage.style.display = "none";
  }
}

// Události pro kontrolu hodnoty při zadávání i opuštění pole
document.getElementById("initial").addEventListener("input", validateMinValue);

document.getElementById("initial").addEventListener("focus", function () {
  document.getElementById("error-message").style.display = "none";
  this.value = cleanInputValue(this);
});
document.getElementById("initial").addEventListener("blur", function () {
  let value = parseInt(cleanInputValue(this));
  if (!isNaN(value)) updateInputValue(this, value);
  calculateAndUpdateChart();
});
document.getElementById("monthly").addEventListener("focus", function () {
  this.value = cleanInputValue(this);
  showInvestmentMessage();
});
document.getElementById("monthly").addEventListener("blur", function () {
  let value = parseInt(cleanInputValue(this));
  if (!isNaN(value)) updateInputValue(this, value);
  hideInvestmentMessage();
  calculateAndUpdateChart();
});

// Skrytí zprávy při kliknutí mimo tlačítka nebo vstupy
document.body.addEventListener("click", function (event) {
  const isClickInside =
    event.target.closest("#monthly-increase") ||
    event.target.closest("#monthly-decrease") ||
    event.target.closest("#monthly");
  if (!isClickInside) {
    hideInvestmentMessage();
  }
});

// Aktualizace grafu při změně hodnoty let
document.getElementById("years").addEventListener("input", function () {
  document.getElementById("years-display").innerHTML =
    `<strong>${this.value}</strong> let`;
  calculateAndUpdateChart();
});

// Funkce pro zobrazení/skrytí zprávy
function showInvestmentMessage() {
  document.getElementById("investment-message").style.display = "block";
}
function hideInvestmentMessage() {
  document.getElementById("investment-message").style.display = "none";
}

updateInputValue(document.getElementById("initial"), 50000);
updateInputValue(document.getElementById("monthly"), 2500);
calculateAndUpdateChart();
