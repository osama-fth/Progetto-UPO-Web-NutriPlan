document.addEventListener('DOMContentLoaded', function() {
  
  // Gestione modal dettagli paziente
  document.querySelectorAll('.btn-dettagli-paziente').forEach(button => {
    button.addEventListener('click', function() {
      const pazienteId = this.getAttribute('data-paziente-id');
      const nome = this.getAttribute('data-paziente-nome');
      const cognome = this.getAttribute('data-paziente-cognome');
      const dataNascita = this.getAttribute('data-paziente-data-nascita');
      const email = this.getAttribute('data-paziente-email');
      
      document.getElementById('paziente-nome').textContent = nome;
      document.getElementById('paziente-cognome').textContent = cognome;
      document.getElementById('paziente-data-nascita').textContent = dataNascita;
      document.getElementById('paziente-email').textContent = email;
      
      // Carica le misurazioni del paziente per il grafico
      fetch(`/admin/pazienti/${pazienteId}/misurazioni`)
        .then(response => response.json())
        .then(misurazioni => {
          if (misurazioni && misurazioni.length > 0) {
            // Formato dei dati per il grafico
            const labels = misurazioni.map(m => m.dataFormattata);
            const values = misurazioni.map(m => m.misura);
            
            // Usa la funzione createWeightChart invece di renderPesoChart
            window.createWeightChart('pazienteChart', labels, values);
          } else {
            // Gestisci caso di nessuna misurazione
            const canvas = document.getElementById('pazienteChart');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Nessuna misurazione disponibile', canvas.width/2, canvas.height/2);
          }
        })
        .catch(error => console.error('Errore nel caricamento delle misurazioni:', error));
      
      // Apre il modal
      const modalDettagliPaziente = new bootstrap.Modal(document.getElementById('pazienteDetailsModal'));
      modalDettagliPaziente.show();
    });
  });
  
  // Gestione piani alimentari paziente - Modificato per usare approccio server-side
  document.querySelectorAll('.btn-piani-paziente').forEach(button => {
    button.addEventListener('click', function() {
      const pazienteId = this.getAttribute('data-paziente-id');
      // Redirect alla nuova route che carica i piani del paziente
      window.location.href = `/admin/pazienti/${pazienteId}/visualizza-piani`;
    });
  });
  
  // Modificato il click sul pulsante "Visualizza piano"
  document.querySelectorAll('.btn-visualizza-piano').forEach(button => {
    button.addEventListener('click', function() {
      const pianoId = this.getAttribute('data-piano-id');
      // Redirect alla nuova route che mostra il piano
      window.location.href = `/admin/piani-alimentari/${pianoId}/visualizza`;
    });
  });
  
  // Gestione creazione nuovo piano alimentare
  document.getElementById('btn-nuovo-piano').addEventListener('click', function() {
    // Imposta la data corrente nel campo data
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('piano-data').value = today;
    
    // Apre il modal
    const modalNuovoPiano = new bootstrap.Modal(document.getElementById('nuovoPianoModal'));
    modalNuovoPiano.show();
  });
  
  // Salvataggio nuovo piano alimentare
  document.getElementById('salva-piano-btn').addEventListener('click', function() {
    const form = document.getElementById('nuovoPianoForm');
    const utenteId = document.getElementById('piano-utente-id').value;
    const titolo = document.getElementById('piano-titolo').value;
    const descrizione = document.getElementById('piano-descrizione').value;
    const data = document.getElementById('piano-data').value;
    
    // Raccolta contenuti del piano alimentare per ogni giorno
    const giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
    const pasti = ['colazione', 'pranzo', 'cena'];
    
    let contenuto = {};
    
    giorni.forEach(giorno => {
      contenuto[giorno] = {};
      pasti.forEach(pasto => {
        const fieldName = `${giorno}_${pasto}`;
        contenuto[giorno][pasto] = document.getElementsByName(fieldName)[0].value;
      });
    });
    
    // Prepara i dati per l'invio
    const pianoData = {
      utenteId,
      titolo,
      descrizione,
      data,
      contenuto: JSON.stringify(contenuto)
    };
    
    // Invia i dati
    fetch('/admin/piani-alimentari/nuovo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pianoData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Chiudi il modal
        const modalNuovoPiano = bootstrap.Modal.getInstance(document.getElementById('nuovoPianoModal'));
        modalNuovoPiano.hide();
        
        // Riapri il modal dei piani e ricarica la lista
        document.querySelector(`.btn-piani-paziente[data-paziente-id="${utenteId}"]`).click();
      }
    })
    .catch(error => console.error('Errore nella creazione del piano alimentare:', error));
  });
  
  // Funzione per aggiungere event listener ai pulsanti di visualizzazione piano
  // La funzione addPianoViewListeners è stata modificata per usare il nuovo approccio server-side
  function addPianoViewListeners() {
    document.querySelectorAll('.btn-visualizza-piano').forEach(button => {
      button.addEventListener('click', function() {
        const pianoId = this.getAttribute('data-piano-id');
        window.location.href = `/admin/piani-alimentari/${pianoId}/visualizza`;
      });
    });
  }
});
