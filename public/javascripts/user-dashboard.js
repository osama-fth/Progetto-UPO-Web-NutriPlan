document.addEventListener('DOMContentLoaded', function() {
  function showModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
    return modal;
  }

  function today() {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, '0');
    const giorno = String(oggi.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  }

  const dataInput = document.getElementById('data');
  if (dataInput) {
    dataInput.value = today();
  }

  // Gestione pulsanti modifica misurazione
  document.querySelectorAll('.btn-modifica-misurazione').forEach(button => {
    button.addEventListener('click', function() {
      const misurazioneId = this.getAttribute('data-misurazione-id');
      const peso = this.getAttribute('data-peso');
      const data = this.getAttribute('data-data');
      
      document.getElementById('misurazioneId').value = misurazioneId;
      document.getElementById('pesoModifica').value = peso;
      document.getElementById('dataModifica').value = data;
      
      const btnEliminaMisurazione = document.getElementById('btnEliminaMisurazione');
      if (btnEliminaMisurazione) {
        btnEliminaMisurazione.setAttribute('data-item-id', misurazioneId);
      }
      
      showModal('misurazioneAzioniModal');
    });
  });

  // Gestione visualizzazione piani alimentari
  document.querySelectorAll('[data-piano-id]').forEach(button => {
    if (button.querySelector('i.fa-eye')) {
      button.addEventListener('click', function() {
        const pianoId = this.getAttribute('data-piano-id');
        const titolo = this.getAttribute('data-piano-titolo');
        const data = this.getAttribute('data-piano-data');
        const descrizione = this.getAttribute('data-piano-descrizione');
        
        document.getElementById('dettaglio-piano-titolo').textContent = titolo;
        document.getElementById('dettaglio-piano-data').textContent = `Data: ${data}`;
        document.getElementById('dettaglio-piano-descrizione').textContent = descrizione || 'Nessuna descrizione disponibile.';
        
        fetch(`/user/piani-alimentari/${pianoId}`)
          .then(response => {
            if (!response.ok) 
              throw new Error(`Errore nella risposta: ${response.status}`);
            return response.json();
          })
          .then(piano => {
            renderDettaglioPiano(piano.contenuto);
            showModal('visualizzaPianoModal');
          })
          .catch(error => {
            console.error('Errore nel caricamento del piano:', error);
          });
      });
    }
  });

  // Funzione per renderizzare il contenuto del piano nel modal
  function renderDettaglioPiano(contenutoJSON) {
    const contenuto = typeof contenutoJSON === 'string' ? JSON.parse(contenutoJSON) : contenutoJSON;
    const giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
    
    giorni.forEach(giorno => {
      const elementoGiorno = document.getElementById(`dettaglio-giorno-${giorno}`);
      if (elementoGiorno) {
        elementoGiorno.style.display = 'none';
      }
    });
    
    for (const giorno of giorni) {
      if (contenuto[giorno]) {
        const elementoGiorno = document.getElementById(`dettaglio-giorno-${giorno}`);
        if (elementoGiorno) {
          elementoGiorno.style.display = 'block';
          const pasti = ['colazione', 'pranzo', 'cena'];
          pasti.forEach(pasto => {
            const elementoPasto = document.getElementById(`dettaglio-${giorno}-${pasto}`);
            if (elementoPasto) {
              elementoPasto.textContent = contenuto[giorno][pasto] || 'Non specificato';
            }
          });
        }
      }
    }
  }

  // Gestione della chiusura dei modal per accessibilità
  const visualizzaPianoModal = document.getElementById('visualizzaPianoModal');
  if (visualizzaPianoModal) {
    visualizzaPianoModal.addEventListener('hidden.bs.modal', function() {
      document.body.focus();
    });
  }

  const misurazioneAzioniModal = document.getElementById('misurazioneAzioniModal');
  if (misurazioneAzioniModal) {
    misurazioneAzioniModal.addEventListener('hidden.bs.modal', function() {
      document.body.focus();
    });
  }

  // Gestione eliminazione misurazioni
  const btnEliminaMisurazioni = document.querySelectorAll('#btnEliminaMisurazione');
  if (btnEliminaMisurazioni.length > 0) {
    btnEliminaMisurazioni.forEach(btn => {
      btn.addEventListener('click', function() {
        const misurazioneId = this.dataset.itemId;
        const linkEliminazione = document.getElementById('eliminaMisurazioneLink');
        linkEliminazione.href = `/user/misurazioni/elimina/${misurazioneId}`;
        const modal = new bootstrap.Modal(document.getElementById('eliminaMisurazioneModal'));
        modal.show();
      });
    });
  }

  // Gestione eliminazione recensione
  const btnEliminaRecensione = document.querySelector('[data-elimina="recensione"]');
  if (btnEliminaRecensione) {
    btnEliminaRecensione.addEventListener('click', function() {
      const recensioneId = this.dataset.itemId;
      document.getElementById('recensioneId').value = recensioneId;
      document.getElementById('eliminaRecensioneForm').action = '/user/recensioni/elimina';
      const modal = new bootstrap.Modal(document.getElementById('eliminaRecensioneModal'));
      modal.show();
    });
  }

  // Gestione eliminazione account
  const btnEliminaAccount = document.getElementById('btnEliminaAccount');
  if (btnEliminaAccount) {
    btnEliminaAccount.addEventListener('click', function() {
      const modal = new bootstrap.Modal(document.getElementById('eliminaAccountModal'));
      modal.show();
    });
  }
});
