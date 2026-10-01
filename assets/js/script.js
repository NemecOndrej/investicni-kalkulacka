let chartInstance;

const translations = {
  cs: {
    title: "Investiční kalkulačka",
    initialLabel: "Počáteční vklad",
    minimumDeposit: "Minimální vklad již od 500 Kč",
    monthlyLabel: "Pravidelná měsíční investice",
    investmentMessage:
      "Pravidelná investice není podmínkou - investujte vždy tolik, kolik si v aktuální situaci můžete dovolit.",
    yearsLabel: "Délka investování",
    year: "rok",
    years: "let",
    resultLabel: "Očekávaná hodnota majetku",
    targetReturn: "Cílový výnos fondu Aurelia je",
    investment: "Investice",
    appreciation: "Zhodnocení",
    months: [
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
    ],
    disclaimer:
      "<strong>Upozornění:</strong> Výpočet je založen na očekávaném zhodnocení, které není zárukou budoucích výnosů. Očekávané zhodnocení vychází z cílového výnosu fondu. Prezentovaný výpočet je pouze ilustrativním odhadem budoucí výkonnosti založeným na stanovených předpokladech a nepředstavuje přesný ukazatel budoucího vývoje. Hodnota investice může kolísat, růst i klesat a investor nemusí získat zpět celou investovanou částku. Výpočet nezahrnuje poplatky a další náklady spojené s investicí. Výnos investora může podléhat zdanění v závislosti na jeho individuální situaci a příslušné daňové úpravě, která se může v budoucnu změnit. Další informace o investici, jejích rizicích a nákladech naleznete ve statutu fondu a ve sdělení klíčových informací (KID). Aurelia nemovitostní fond, podfond, je podfondem Aurelia fondy SICAV a.s.",
  },
  en: {
    title: "Investment Calculator",
    initialLabel: "Initial investment",
    minimumDeposit: "Minimum investment from CZK 500",
    monthlyLabel: "Regular monthly investment",
    investmentMessage:
      "Regular investing is not required – always invest only as much as you can afford in your current situation.",
    yearsLabel: "Investment period",
    year: "year",
    years: "years",
    resultLabel: "Expected portfolio value",
    targetReturn: "The Aurelia fund's target return is",
    investment: "Contributions",
    appreciation: "Portfolio value",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    disclaimer:
      "<strong>Disclaimer:</strong> The calculation is based on expected appreciation, which is not a guarantee of future returns. The expected appreciation is derived from the fund's target return. The calculation presented is merely an illustrative estimate of future performance based on specified assumptions and is not an exact indicator of future developments. The value of the investment may fluctuate, rise or fall, and the investor may not get back the full amount invested. The calculation does not include fees and other costs associated with the investment. The investor's return may be subject to taxation depending on their individual circumstances and the applicable tax legislation, which may change in the future. Further information about the investment, its risks and costs can be found in the fund's statute and in the Key Information Document (KID). Aurelia nemovitostní fond, podfond, is a sub-fund of Aurelia fondy SICAV a.s.",
  },
};

const requestedLanguage = new URLSearchParams(window.location.search)
  .get("lang")
  ?.toLowerCase();
const language = requestedLanguage === "en" ? "en" : "cs";
const locale = language === "en" ? "en-GB" : "cs-CZ";
const t = translations[language];

function updateYearsDisplay(value) {
  const unit = Number(value) === 1 ? t.year : t.years;
  document.getElementById("years-display").innerHTML =
    `<strong>${value}</strong> ${unit}`;
}

function applyTranslations() {
  document.documentElement.lang = language;
  document.title = t.title;
  document.getElementById("initial-label").textContent = t.initialLabel;
  document.getElementById("error-message").textContent = t.minimumDeposit;
  document.getElementById("monthly-label").textContent = t.monthlyLabel;
  document.getElementById("investment-message").textContent =
    t.investmentMessage;
  document.getElementById("years-label").textContent = t.yearsLabel;
  document.getElementById("result-label").textContent = t.resultLabel;
  document.getElementById("target-return-label").textContent = t.targetReturn;
  document.getElementById("disclaimer").innerHTML = t.disclaimer;
  updateYearsDisplay(document.getElementById("years").value);
}

// Formátování čísla s měnou Kč
function formatNumberWithCurrency(value) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CZK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Vyčištění vstupní hodnoty pro čisté číslo
function cleanInputValue(input) {
  return input.value.replace(/[^\d-]/g, "");
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

  let labels, investiceData, zhodnoceniData;
  if (years === 1) {
    labels = t.months;
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
        label: t.investment,
        data: investiceData,
        backgroundColor: gradientInvestice,

        fill: true,
        tension: 0.4,
      },
      {
        label: t.appreciation,
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
              return value.toLocaleString(locale, {
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

document
  .getElementById("initial-decrease")
  .addEventListener("click", function () {
    const input = document.getElementById("initial");
    let value = parseInt(cleanInputValue(input));
    value -= 5000;
    value = value < 500 ? 500 : value;
    updateInputValue(input, value);
    document.getElementById("error-message").style.display = "none";
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

// Kontrola minimální hodnoty pro počáteční vklad
function validateMinValue() {
  const input = document.getElementById("initial");
  const errorMessage = document.getElementById("error-message");
  const numericValue = parseInt(cleanInputValue(input));

  if (numericValue <= 500) {
    errorMessage.style.display = numericValue === 500 ? "none" : "block";
  } else {
    errorMessage.style.display = "none";
  }
}

// Události pro kontrolu hodnoty při zadávání
document.getElementById("initial").addEventListener("input", validateMinValue);

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
  const minValue = 500;
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
  updateYearsDisplay(this.value);
  calculateAndUpdateChart();
});

// Funkce pro zobrazení/skrytí zprávy
function showInvestmentMessage() {
  document.getElementById("investment-message").style.display = "block";
}
function hideInvestmentMessage() {
  document.getElementById("investment-message").style.display = "none";
}

applyTranslations();
updateInputValue(document.getElementById("initial"), 50000);
updateInputValue(document.getElementById("monthly"), 2500);
calculateAndUpdateChart();
