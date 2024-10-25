let chartInstance;

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

function cleanInputValue(input) {
  return input.value.replace(/\s+Kč/g, '').replace(/\s/g, '');
}

function updateInputValue(input, value) {
  input.value = formatNumberWithCurrency(Math.round(value));
}
function calculateFutureValue(initial, monthly, years, rate) {
  const months = years * 12;
  const monthlyRate = rate / 12;

  let futureValue = initial * Math.pow(1 + monthlyRate, months);

  for (let i = 1; i <= months; i++) {
    futureValue += monthly * Math.pow(1 + monthlyRate, months - i);
  }

  return futureValue;
}

function calculateAndUpdateChart() {
  const initial = parseInt(cleanInputValue(document.getElementById('initial')));
  const monthly = parseInt(cleanInputValue(document.getElementById('monthly')));
  const years = parseFloat(document.getElementById('years').value);
  const rate = 0.06; // Roční výnos 6%

  const futureValue = calculateFutureValue(initial, monthly, years, rate);
  document.getElementById('futureValue').innerText =
    formatNumberWithCurrency(futureValue);

  const czechMonths = [
    'Leden',
    'Únor',
    'Březen',
    'Duben',
    'Květen',
    'Červen',
    'Červenec',
    'Srpen',
    'Září',
    'Říjen',
    'Listopad',
    'Prosinec',
  ];

  let labels, investiceData, zhodnoceniData;
  if (years === 1) {
    labels = czechMonths;

    investiceData = Array.from({ length: 12 }, (_, i) => {
      return initial + monthly * (i + 1);
    });

    zhodnoceniData = Array.from({ length: 12 }, (_, i) => {
      return calculateFutureValue(initial, monthly, (i + 1) / 12, rate);
    });
  } else {
    labels = Array.from({ length: years }, (_, i) => 2024 + i);

    investiceData = Array.from({ length: years }, (_, i) => {
      return initial + monthly * 12 * (i + 1);
    });

    zhodnoceniData = Array.from({ length: years }, (_, i) => {
      return calculateFutureValue(initial, monthly, i + 1, rate);
    });
  }

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
            display: false,
          },
          ticks: {
            stepSize: years === 1 ? 1 : 5,
            callback: function (val, index) {
              return this.getLabelForValue(val);
            },
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          position: 'right',
          grid: {
            display: true,
            color: '#ddd',
          },
          ticks: {
            stepSize: 100000,
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
          radius: years === 1 ? 3 : 0,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            usePointStyle: true,
            color: '#4e3a65',
            font: {
              family: 'Manrope',
              size: 14,
            },
            padding: 37,
            textAlign: 'center',
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

document.getElementById('initial').addEventListener('focus', function () {
  const input = document.getElementById('initial');
  input.value = cleanInputValue(input); // Odstraníme "Kč" a mezery
});

document.getElementById('monthly').addEventListener('focus', function () {
  const input = document.getElementById('monthly');
  input.value = cleanInputValue(input); // Odstraníme "Kč" a mezery
});

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

function validateMinValue() {
  const input = document.getElementById('initial');
  const errorMessage = document.getElementById('error-message');
  const minValue = 1000;

  const numericValue = parseInt(input.value.replace(/\D/g, ''));

  if (numericValue < minValue || isNaN(numericValue)) {
    errorMessage.style.display = 'block';
  } else {
    errorMessage.style.display = 'none';
  }
}

function enforceMinValue() {
  const input = document.getElementById('initial');
  const minValue = 1000;

  const numericValue = parseInt(input.value.replace(/\D/g, ''));

  if (numericValue < minValue || isNaN(numericValue)) {
    input.value = `${minValue} Kč`;
  }
}

function showInvestmentMessage() {
  const message = document.getElementById('investment-message');
  message.style.display = 'block';
}

function hideInvestmentMessage() {
  const message = document.getElementById('investment-message');
  message.style.display = 'none';
}

updateInputValue(document.getElementById('initial'), 500000);
updateInputValue(document.getElementById('monthly'), 10000);
calculateAndUpdateChart();
