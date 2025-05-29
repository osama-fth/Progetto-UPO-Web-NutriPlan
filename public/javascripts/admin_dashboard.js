document.addEventListener('DOMContentLoaded', function() {
  
  // Variabile per memorizzare l'istanza del grafico
  let pazienteGrafico = null;
  
  // Gestione modal dettagli paziente
  document.querySelectorAll('.btn-dettagli-paziente').forEach(button => {
    button.addEventListener('click', function() {
      const pazienteId = this.getAttribute('data-paziente-id');
      const nome = this.getAttribute('data-paziente-nome');
      const cognome = this.getAttribute('data-paziente-cognome');
      const dataNascita = this.getAttribute('data-paziente-data-nascita');
      const email = this.getAttribute('data-paziente-email');
      
      // Aggiorna i campi del modal con i dati del paziente
      document.getElementById('paziente-nome').textContent = nome;
      document.getElementById('paziente-cognome').textContent = cognome;
      document.getElementById('paziente-data-nascita').textContent = dataNascita;
      document.getElementById('paziente-email').textContent = email;
      
      // Distruggi il grafico precedente se esiste
      if (pazienteGrafico) {
        pazienteGrafico.destroy();
        pazienteGrafico = null;
      }
      
      // Carica le misurazioni del paziente per il grafico
      fetch(`/admin/pazienti/${pazienteId}/misurazioni`)
        .then(response => response.json())
        .then(misurazioni => {
          if (misurazioni && misurazioni.length > 0) {
            // Formato dei dati per il grafico
            const labels = misurazioni.map(m => m.dataFormattata);
            const values = misurazioni.map(m => m.misura);
            
            // Crea il nuovo grafico e salva l'istanza nella variabile
            pazienteGrafico = window.createWeightChart('pazienteChart', labels, values);
          } else {
            // Anche per un grafico vuoto, salva l'istanza
            pazienteGrafico = window.createWeightChart('pazienteChart', [], []);
          }
        })
        .catch(error => console.error('Errore nel caricamento delle misurazioni:', error));
      
      // Apre il modal
      const modalDettagliPaziente = new bootstrap.Modal(document.getElementById('pazienteDetailsModal'));
      modalDettagliPaziente.show();
    });
  });
  
  // Aggiungi anche un listener per la chiusura del modal che distrugge il grafico
  document.getElementById('pazienteDetailsModal').addEventListener('hidden.bs.modal', function() {
    if (pazienteGrafico) {
      pazienteGrafico.destroy();
      pazienteGrafico = null;
    }
  });
  
  // Gestione creazione nuovo piano alimentare per pulsante inline
  if (document.getElementById('btn-nuovo-piano-inline')) {
    document.getElementById('btn-nuovo-piano-inline').addEventListener('click', function() {
      // Imposta l'ID paziente per il form del nuovo piano
      const pazienteId = window.location.pathname.split('/')[3]; // Estrai l'ID del paziente dall'URL
      
      // Imposta la data corrente nel campo data
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('piano-data').value = today;
      
      // Imposta l'ID del paziente nel form
      document.getElementById('piano-utente-id').value = pazienteId;
      
      // Apre il modal
      const modalNuovoPiano = new bootstrap.Modal(document.getElementById('nuovoPianoModal'));
      modalNuovoPiano.show();
    });
  }
  
  // Gestione creazione nuovo piano alimentare (per il pulsante originale se esiste)
  if (document.getElementById('btn-nuovo-piano')) {
    document.getElementById('btn-nuovo-piano').addEventListener('click', function() {
      // Imposta la data corrente nel campo data
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('piano-data').value = today;
      
      // Apre il modal
      const modalNuovoPiano = new bootstrap.Modal(document.getElementById('nuovoPianoModal'));
      modalNuovoPiano.show();
    });
  }
  
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
        
        // Reindirizza alla pagina dei piani del paziente
        window.location.href = `/admin/pazienti/${utenteId}/visualizza-piani`;
      }
    })
    .catch(error => console.error('Errore nella creazione del piano alimentare:', error));
  });
  
});
