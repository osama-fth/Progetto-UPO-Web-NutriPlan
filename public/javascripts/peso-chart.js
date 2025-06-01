window.createWeightChart = function(canvasId, labels, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  const deepBlue = '#023e8a';
  const mediumBlue = '#0077B6';
  const brightCyan = '#0096c7';
  const brightBlue = '#00B4D8';
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(144, 224, 239, 0.7)');
  gradient.addColorStop(1, 'rgba(202, 240, 248, 0.1)');
  
  const hasData = Array.isArray(labels) && Array.isArray(values) && labels.length > 0 && values.length > 0;
  
  const datasetOptions = hasData ? {
    label: 'Peso (kg)',
    data: values,
    backgroundColor: gradient,
    borderColor: brightBlue,
    borderWidth: 3,
    tension: 0.3,
    pointBackgroundColor: 'white',
    pointBorderColor: mediumBlue,
    pointBorderWidth: 2,
    pointRadius: 6,
    pointHoverRadius: 8,
    pointHoverBackgroundColor: brightCyan,
    pointHoverBorderColor: 'white',
    pointHoverBorderWidth: 2,
    fill: true
  } : {
    label: 'Peso (kg)',
    data: [],
    borderColor: brightBlue,
    borderWidth: 2
  };

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: hasData ? labels : [''],
      datasets: [datasetOptions]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          title: {
            display: true,
            text: 'Peso (kg)',
            color: deepBlue,
            font: { weight: '600', size: 14 }
          },
          ticks: { color: mediumBlue }
        },
        x: {
          grid: { display: true },
          title: {
            display: true,
            text: 'Data',
            color: deepBlue,
            font: { weight: '600', size: 14 }
          },
          ticks: { color: mediumBlue, autoSkip: false }
        }
      },
      plugins: {
        tooltip: {
          backgroundColor: 'rgba(2, 62, 138, 0.8)',
          titleFont: { weight: 'bold' },
          titleColor: '#CAF0F8',
          bodyFont: { size: 14 },
          bodyColor: 'white',
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Peso: ${context.parsed.y} kg`;
            }
          }
        },
        legend: { display: false },
        noDataMessage: {
          id: 'noDataMessage',
          afterDraw: function(chart) {
            if (chart.data.datasets[0].data.length === 0) {
              const width = chart.width;
              const height = chart.height;
              const ctx = chart.ctx;
              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.font = '14px Arial';
              ctx.fillStyle = '#6c757d';
              ctx.fillText('Nessuna misurazione disponibile', width / 2, height / 2);
              ctx.restore();
            }
          }
        }
      }
    },
    plugins: [{ id: 'noDataMessage' }]
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const initChart = (canvasId) => {
    const chartDataElement = document.getElementById(`chart-data-${canvasId}`);
    if (!chartDataElement) return;
    try {
      const chartData = JSON.parse(chartDataElement.textContent);
      createWeightChart(canvasId, chartData.labels || [], chartData.values || []);
      
      const noChartData = document.getElementById(`no-chart-data-${canvasId}`);
      if (noChartData) {
        noChartData.style.display = 'none';
      }
    } catch (e) {
      console.error(`Errore nel parsing dei dati del grafico ${canvasId}:`, e);
    }
  };
  
  initChart('myChart');
});
