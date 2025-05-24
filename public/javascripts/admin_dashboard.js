document.addEventListener('DOMContentLoaded', function() {
  // Rimossa la gestione della visualizzazione delle sezioni basata su JavaScript
  // poiché la visibilità è ora gestita direttamente dal template EJS
  
  // Gestione modal dettagli paziente
  document.querySelectorAll('[data-paziente-id]').forEach(button => {
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
            renderPesoChart(misurazioni, 'pazienteChart');
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
  
  // Gestione piani alimentari paziente
  document.querySelectorAll('.btn-piani-paziente').forEach(button => {
    button.addEventListener('click', function() {
      const pazienteId = this.getAttribute('data-paziente-id');
      const nome = this.getAttribute('data-paziente-nome');
      const cognome = this.getAttribute('data-paziente-cognome');
      
      document.getElementById('piani-paziente-nome').textContent = `${nome} ${cognome}`;
      document.getElementById('piano-utente-id').value = pazienteId;
      
      // Carica i piani alimentari del paziente
      fetch(`/admin/pazienti/${pazienteId}/piani-alimentari`)
        .then(response => response.json())
        .then(piani => {
          const tableBody = document.getElementById('piani-alimentari-table-body');
          const noPlansRow = document.getElementById('no-piani-row');
          
          // Pulisci la tabella esistente tranne la riga "nessun piano"
          Array.from(tableBody.children).forEach(child => {
            if (child.id !== 'no-piani-row') {
              tableBody.removeChild(child);
            }
          });
          
          if (piani && piani.length > 0) {
            noPlansRow.classList.add('d-none');
            
            piani.forEach(piano => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td class="text-center">${piano.titolo}</td>
                <td class="text-center">${piano.dataFormattata}</td>
                <td class="text-center">
                  <div class="d-flex justify-content-center">
                    <button type="button" class="btn btn-sm btn-outline-primary me-2 btn-visualizza-piano" 
                      data-piano-id="${piano.id}" 
                      data-piano-titolo="${piano.titolo}" 
                      data-piano-data="${piano.dataFormattata}" 
                      data-piano-descrizione="${piano.descrizione || ''}">
                      <i class="fas fa-eye me-1"></i> Visualizza
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger" 
                      data-elimina="piano" data-item-id="${piano.id}">
                      <i class="fas fa-trash me-1"></i> Elimina
                    </button>
                  </div>
                </td>
              `;
              tableBody.insertBefore(row, noPlansRow);
            });
            
            // Aggiungi gli event listener ai pulsanti appena creati
            addPianoViewListeners();
          } else {
            noPlansRow.classList.remove('d-none');
          }
        })
        .catch(error => console.error('Errore nel caricamento dei piani alimentari:', error));
      
      // Apre il modal
      const modalPianiAlimentari = new bootstrap.Modal(document.getElementById('pianiAlimentariModal'));
      modalPianiAlimentari.show();
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
  function addPianoViewListeners() {
    document.querySelectorAll('.btn-visualizza-piano').forEach(button => {
      button.addEventListener('click', function() {
        const pianoId = this.getAttribute('data-piano-id');
        const titolo = this.getAttribute('data-piano-titolo');
        const data = this.getAttribute('data-piano-data');
        const descrizione = this.getAttribute('data-piano-descrizione');
        
        document.getElementById('visualizza-piano-titolo').textContent = titolo;
        document.getElementById('visualizza-piano-data').textContent = data;
        document.getElementById('visualizza-piano-descrizione').textContent = descrizione;
        
        // Carica i dettagli del piano
        fetch(`/admin/piani-alimentari/${pianoId}`)
          .then(response => response.json())
          .then(piano => {
            if (piano && piano.contenuto) {
              const contenuto = typeof piano.contenuto === 'string' ? JSON.parse(piano.contenuto) : piano.contenuto;
              
              const giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
              const pasti = ['colazione', 'pranzo', 'cena'];
              
              giorni.forEach(giorno => {
                const capitalized = giorno.charAt(0).toUpperCase() + giorno.slice(1);
                
                pasti.forEach(pasto => {
                  const elementId = `visualizza-${giorno}-${pasto}`;
                  const element = document.getElementById(elementId);
                  
                  if (element) {
                    if (contenuto[giorno] && contenuto[giorno][pasto]) {
                      element.textContent = contenuto[giorno][pasto];
                    } else {
                      element.textContent = 'Nessuna indicazione';
                    }
                  }
                });
              });
            }
          })
          .catch(error => console.error('Errore nel caricamento del piano alimentare:', error));
        
        // Apre il modal
        const modalVisualizzaPiano = new bootstrap.Modal(document.getElementById('visualizzaPianoModal'));
        modalVisualizzaPiano.show();
      });
    });
  }
});
