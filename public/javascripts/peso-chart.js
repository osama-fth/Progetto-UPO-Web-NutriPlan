document.addEventListener('DOMContentLoaded', function() {
  // Ottieni il contesto del canvas
  const ctx = document.getElementById('myChart').getContext('2d');
  
  // Otteniamo i dati dalle misurazioni (dall'elemento script con id chart-data)
  let chartData;
  try {
    chartData = JSON.parse(document.getElementById('chart-data').textContent);
  } catch (e) {
    console.error('Errore nel parsing dei dati del grafico:', e);
    chartData = { labels: [], values: [] };
  }
  
  // Configurazione del grafico
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [{
        label: 'Peso (kg)',
        data: chartData.values,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.1,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Peso (kg)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Data'
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Peso: ${context.parsed.y} kg`;
            }
          }
        },
        legend: {
          display: false,
        }
      }
    }
  });
});
