let chartInstance; // Proměnná pro instanci grafu

// Pomocná funkce pro formátování čísla s měnou Kč (bez desetinných míst)
function formatNumberWithCurrency(value) {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('CZK', 'Kč');
}

// Funkce pro odstranění měny a formátovacích znaků při focusu na input
function cleanInputValue(input) {
  return input.value.replace(/\s+Kč/g, '').replace(/\s/g, '');
}

// Funkce pro aktualizaci hodnoty inputu a přidání Kč
function updateInputValue(input, value) {
  input.value = formatNumberWithCurrency(Math.round(value)); // Zaokrouhlí na celé číslo
}
// Opravená funkce pro výpočet složeného úroku
function calculateFutureValue(initial, monthly, years, rate) {
  const months = years * 12;
  const monthlyRate = rate / 12; // Měsíční úroková sazba

  // Zhodnocení počátečního vkladu
  let futureValue = initial * Math.pow(1 + monthlyRate, months);

  // Přidání měsíčních investic, kde každá investice má jiné zhodnocení podle doby v investici
  for (let i = 1; i <= months; i++) {
    futureValue += monthly * Math.pow(1 + monthlyRate, months - i);
  }

  return futureValue;
}

// Funkce pro výpočet a zobrazení grafu
function calculateAndUpdateChart() {
  const initial = parseInt(cleanInputValue(document.getElementById('initial')));
  const monthly = parseInt(cleanInputValue(document.getElementById('monthly')));
  const years = parseFloat(document.getElementById('years').value);
  const rate = 0.06; // Roční výnos 6%

  const futureValue = calculateFutureValue(initial, monthly, years, rate);
  document.getElementById('futureValue').innerText =
    formatNumberWithCurrency(futureValue);

  // Data pro graf - zobrazení pouze po rocích
  const labels = Array.from({ length: years }, (_, i) => 2024 + i);

  const investiceData = Array.from({ length: years }, (_, i) => {
    let totalInvestment = initial + monthly * 12 * i;
    return totalInvestment;
  });

  const zhodnoceniData = Array.from({ length: years }, (_, i) => {
    return calculateFutureValue(initial, monthly, i, rate);
  });

  const ctx = document.getElementById('investmentChart').getContext('2d');

  const gradientInvestice = ctx.createLinearGradient(0, 0, 0, 400);
  gradientInvestice.addColorStop(0, '#ccc');
  gradientInvestice.addColorStop(1, '#eee');

  const gradientZhodnoceni = ctx.createLinearGradient(0, 0, 0, 400);
  gradientZhodnoceni.addColorStop(0, '#4e3a65');
  gradientZhodnoceni.addColorStop(1, '#7a5e95');

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Investice',
        data: investiceData,
        backgroundColor: gradientInvestice,
        borderColor: '#ccc',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Zhodnocení',
        data: zhodnoceniData,
        backgroundColor: gradientZhodnoceni,
        borderColor: '#4e3a65',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false, // Skryjeme mřížku na ose X
          },
          ticks: {
            stepSize: 5,
            callback: function (val, index) {
              return this.getLabelForValue(val); // Rotujeme popisky na ose Xy
            },
            maxRotation: 45, // Rotace popisků
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          position: 'right', // Stupnice bude napravo
          grid: {
            display: true,
            color: '#ddd',
          },
          ticks: {
            stepSize: 1000000,
            callback: function (value) {
              return value.toLocaleString('cs-CZ', {
                style: 'currency',
                currency: 'CZK',
                minimumFractionDigits: 0,
              });
            },
          },
        },
      },
      elements: {
        point: {
          radius: 0, // Skryjeme body na grafu
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom', // Umístíme legendu pod graf
          labels: {
            usePointStyle: true, // Použijeme kolečka místo čtverců
            color: '#4e3a65',
            font: {
              family: 'Manrope',
              size: 14,
            },
            padding: 20,
          },
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  };

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, config);
}

// Event listenery pro tlačítka zvýšení/snížení hodnot
document
  .getElementById('initial-increase')
  .addEventListener('click', function () {
    const input = document.getElementById('initial');
    let value = parseInt(cleanInputValue(input));
    value += 10000;
    updateInputValue(input, value);
    calculateAndUpdateChart();
  });

document
  .getElementById('initial-decrease')
  .addEventListener('click', function () {
    const input = document.getElementById('initial');
    let value = parseInt(cleanInputValue(input));
    if (value > 0) {
      value -= 10000;
      updateInputValue(input, value);
    }
    calculateAndUpdateChart();
  });

document
  .getElementById('monthly-increase')
  .addEventListener('click', function () {
    const input = document.getElementById('monthly');
    let value = parseInt(cleanInputValue(input));
    value += 1000;
    updateInputValue(input, value);
    calculateAndUpdateChart();
  });

document
  .getElementById('monthly-decrease')
  .addEventListener('click', function () {
    const input = document.getElementById('monthly');
    let value = parseInt(cleanInputValue(input));
    if (value > 0) {
      value -= 1000;
      updateInputValue(input, value);
    }
    calculateAndUpdateChart();
  });

// Při focusu na input odstraníme formátování a měnu
document.getElementById('initial').addEventListener('focus', function () {
  const input = document.getElementById('initial');
  input.value = cleanInputValue(input); // Odstraníme "Kč" a mezery
});

document.getElementById('monthly').addEventListener('focus', function () {
  const input = document.getElementById('monthly');
  input.value = cleanInputValue(input); // Odstraníme "Kč" a mezery
});

// Při blur formátujeme zpět na formátované číslo s "Kč"
document.getElementById('initial').addEventListener('blur', function () {
  const input = document.getElementById('initial');
  let value = parseInt(cleanInputValue(input));
  if (!isNaN(value)) {
    updateInputValue(input, value);
    calculateAndUpdateChart();
  }
});

document.getElementById('monthly').addEventListener('blur', function () {
  const input = document.getElementById('monthly');
  let value = parseInt(cleanInputValue(input));
  if (!isNaN(value)) {
    updateInputValue(input, value);
    calculateAndUpdateChart();
  }
});

document.getElementById('years').addEventListener('input', function () {
  const years = document.getElementById('years').value;
  document.getElementById(
    'years-display',
  ).innerHTML = `<strong>${years}</strong> let`;
  calculateAndUpdateChart();
});

// Inicializace grafu při prvním načtení
updateInputValue(document.getElementById('initial'), 500000);
updateInputValue(document.getElementById('monthly'), 10000);
calculateAndUpdateChart();
