document.addEventListener('DOMContentLoaded', function() {
  // Ottieni il contesto del canvas
  const canvas = document.getElementById('myChart');
  const ctx = canvas.getContext('2d');
  
  // Otteniamo i dati dalle misurazioni
  let chartData;
  try {
    chartData = JSON.parse(document.getElementById('chart-data').textContent);
  } catch (e) {
    console.error('Errore nel parsing dei dati del grafico:', e);
    chartData = { labels: [], values: [] };
  }
  
  // Colori dal CSS
  const deepBlue = '#023e8a';
  const mediumBlue = '#0077B6';
  const brightCyan = '#0096c7';
  const brightBlue = '#00B4D8';
  
  // Gradiente per lo sfondo dell'area
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(144, 224, 239, 0.7)');
  gradient.addColorStop(1, 'rgba(202, 240, 248, 0.1)');
  
  // Configurazione del grafico
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Peso (kg)',
        data: chartData.values,
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
      }]
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
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          title: {
            display: true,
            text: 'Peso (kg)',
            color: deepBlue,
            font: {
              weight: '600',
              size: 14
            }
          },
          ticks: {
            color: mediumBlue
          }
        },
        x: {
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'Data',
            color: deepBlue,
            font: {
              weight: '600',
              size: 14
            }
          },
          ticks: {
            color: mediumBlue
          }
        }
      },
      plugins: {
        tooltip: {
          backgroundColor: 'rgba(2, 62, 138, 0.8)',
          titleFont: {
            weight: 'bold'
          },
          titleColor: '#CAF0F8',
          bodyFont: {
            size: 14
          },
          bodyColor: 'white',
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: function(context) {
              return `Peso: ${context.parsed.y} kg`;
            }
          }
        },
        legend: {
          display: false
        }
      }
    }
  });
});
