/**
 * Crea un grafico per visualizzare i dati del peso
 * @param {string} canvasId - L'ID del canvas dove disegnare il grafico
 * @param {Array} labels - Array delle etichette per l'asse x (date)
 * @param {Array} values - Array dei valori per l'asse y (pesi)
 */
function createWeightChart(canvasId, labels, values) {
  // Ottieni il contesto del canvas
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;
  
  const ctx = canvas.getContext('2d');
  
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
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
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
            display: true
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
            color: mediumBlue,
            autoSkip: false
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
}

/**
 * Aggiorna la tabella delle misurazioni del paziente usando un approccio forEach
 * @param {Array} misurazioni - Array di oggetti con le misurazioni (data e peso)
 */
function updateTabellaStoriaQuantitativa(misurazioni) {
  // Ottieni riferimento alla tabella
  const tabella = document.getElementById('tabella-misurazioni');
  
  // Se non ci sono misurazioni, mostra solo il messaggio "nessuna misurazione"
  if (!misurazioni || misurazioni.length === 0) {
    tabella.innerHTML = `
      <tr id="no-misurazioni-row">
        <td colspan="2" class="text-center py-4">
          <i class="fas fa-weight text-muted mb-3" style="font-size: 3rem;"></i>
          <p class="text-muted mb-0">Nessuna misurazione disponibile</p>
        </td>
      </tr>
    `;
    return;
  }
  
  // Costruisci l'HTML della tabella usando forEach
  let htmlContent = '';
  
  misurazioni.forEach(misurazione => {
    // Formatta la data in formato italiano
    const data = new Date(misurazione.data);
    const dataFormattata = data.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    htmlContent += `
      <tr>
        <td class="text-center">${dataFormattata}</td>
        <td class="text-center">${misurazione.peso} kg</td>
      </tr>
    `;
  });
  
  // Aggiungi la riga "nessuna misurazione" nascosta per uso futuro
  htmlContent += `
    <tr id="no-misurazioni-row" style="display: none;">
      <td colspan="2" class="text-center py-4">
        <i class="fas fa-weight text-muted mb-3" style="font-size: 3rem;"></i>
        <p class="text-muted mb-0">Nessuna misurazione disponibile</p>
      </td>
    </tr>
  `;
  
  // Aggiorna la tabella con il nuovo contenuto
  tabella.innerHTML = htmlContent;
}

// Inizializza il grafico principale quando il documento è pronto
document.addEventListener('DOMContentLoaded', function() {
  // Controlla se esiste l'elemento chart-data
  const chartDataElement = document.getElementById('chart-data');
  if (!chartDataElement) return;
  
  // Otteniamo i dati dalle misurazioni
  try {
    const chartData = JSON.parse(chartDataElement.textContent);
    createWeightChart('myChart', chartData.labels, chartData.values);
  } catch (e) {
    console.error('Errore nel parsing dei dati del grafico:', e);
  }
});

// Aggiungi questa funzione per gestire l'apertura del modal paziente
document.addEventListener('DOMContentLoaded', function() {
  // Trova il modal dei dettagli del paziente
  const pazienteModal = document.getElementById('pazienteDetailsModal');
  
  if (pazienteModal) {
    // Aggiungi un listener per l'evento 'show.bs.modal'
    pazienteModal.addEventListener('show.bs.modal', function(event) {
      const button = event.relatedTarget;
      if (!button) return;
      
      // Ottieni le misurazioni dal pulsante che ha attivato il modal (se disponibili)
      const misurazioniData = button.getAttribute('data-misurazioni');
      
      if (misurazioniData) {
        try {
          const misurazioni = JSON.parse(misurazioniData);
          
          // Aggiorna la tabella con le misurazioni usando l'approccio forEach
          updateTabellaStoriaQuantitativa(misurazioni);
          
          // Preparazione dati per il grafico
          if (misurazioni.length > 0) {
            const labels = misurazioni.map(m => {
              const data = new Date(m.data);
              return data.toLocaleDateString('it-IT', {day: '2-digit', month: '2-digit'});
            });
            const values = misurazioni.map(m => m.peso);
            
            // Crea o aggiorna il grafico
            createWeightChart('pazienteChart', labels, values);
            document.getElementById('no-chart-data').style.display = 'none';
          } else {
            document.getElementById('no-chart-data').style.display = 'block';
          }
        } catch (e) {
          console.error('Errore nel parsing dei dati delle misurazioni:', e);
          // In caso di errore, mostra il messaggio "nessuna misurazione"
          updateTabellaStoriaQuantitativa([]);
          document.getElementById('no-chart-data').style.display = 'block';
        }
      } else {
        // Se non ci sono misurazioni, mostra il messaggio appropriato
        updateTabellaStoriaQuantitativa([]);
        document.getElementById('no-chart-data').style.display = 'block';
      }
    });
  }
});
