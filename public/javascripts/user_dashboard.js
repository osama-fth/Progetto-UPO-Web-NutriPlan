document.addEventListener('DOMContentLoaded', function() {
  const uiUtils = {
    showModal(modalId) {
      const modal = new bootstrap.Modal(document.getElementById(modalId));
      modal.show();
      return modal;
    },
    
    hideModal(modalId) {
      const modalElement = document.getElementById(modalId);
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    },
    
    today() {
      const oggi = new Date();
      const anno = oggi.getFullYear();
      const mese = String(oggi.getMonth() + 1).padStart(2, '0');
      const giorno = String(oggi.getDate()).padStart(2, '0');
      return `${anno}-${mese}-${giorno}`;
    }
  };

  const misurazioniManager = {
    init() {
      this.setupDateInputDefault();
      this.setupModifyButtons();
    },
    
    setupDateInputDefault() {
      const dataInput = document.getElementById('data');
      if (dataInput) {
        dataInput.value = uiUtils.today();
      }
    },
    
    setupModifyButtons() {
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
          
          uiUtils.showModal('misurazioneAzioniModal');
        });
      });
    }
  };
  const pianiAlimentariManager = {
    init() {
      this.setupPianiButtons();
    },
    
    setupPianiButtons() {
      document.querySelectorAll('[data-piano-id]').forEach(button => {
        if (button.querySelector('i.fa-eye')) {
          button.addEventListener('click', () => {
            const pianoId = button.getAttribute('data-piano-id');
            const titolo = button.getAttribute('data-piano-titolo');
            const data = button.getAttribute('data-piano-data');
            const descrizione = button.getAttribute('data-piano-descrizione');
            
            document.getElementById('dettaglio-piano-titolo').textContent = titolo;
            document.getElementById('dettaglio-piano-data').textContent = `Data: ${data}`;
            document.getElementById('dettaglio-piano-descrizione').textContent = descrizione || 'Nessuna descrizione disponibile.';
            
            fetch(`/user/piani-alimentari/${pianoId}`)
              .then(response => {
                if (!response.ok) throw new Error(`Errore nella risposta: ${response.status}`);
                return response.json();
              })
              .then(piano => {
                this.renderDettaglioPiano(piano.contenuto);
                uiUtils.showModal('visualizzaPianoModal');
              })
              .catch(error => {
                console.error('Errore nel caricamento del piano:', error);
                alert('Errore nel caricamento dei dettagli del piano alimentare');
              });
          });
        }
      });
    },
    
    renderDettaglioPiano(contenutoJSON) {
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
            
            // Aggiorna i contenuti dei pasti
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
  };

  misurazioniManager.init();
  pianiAlimentariManager.init();
});
