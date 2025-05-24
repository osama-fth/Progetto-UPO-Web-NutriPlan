document.addEventListener('DOMContentLoaded', function() {
  // ===== Utility per UI =====
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

  // ===== Gestione navigazione =====
  // Rimosso navigationManager poiché ora utilizziamo URL reali invece di hash

  // ===== Gestione misurazioni =====
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
          
          // Aggiorniamo l'id dell'elemento da eliminare nel pulsante di eliminazione
          const btnEliminaMisurazione = document.getElementById('btnEliminaMisurazione');
          if (btnEliminaMisurazione) {
            btnEliminaMisurazione.setAttribute('data-item-id', misurazioneId);
          }
          
          uiUtils.showModal('misurazioneAzioniModal');
        });
      });
    }
  };
  
  // ===== Gestione piani alimentari =====
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
      const accordionContainer = document.getElementById('dettaglioPianoDieteticoAccordion');
      
      accordionContainer.innerHTML = '';
      
      const giorni = {
        'lunedì': 'Lunedì',
        'martedì': 'Martedì',
        'mercoledì': 'Mercoledì',
        'giovedì': 'Giovedì',
        'venerdì': 'Venerdì',
        'sabato': 'Sabato',
        'domenica': 'Domenica'
      };
      
      let index = 0;
      for (const [giorno, label] of Object.entries(giorni)) {
        if (contenuto[giorno]) {
          const accordionItem = document.createElement('div');
          accordionItem.className = 'accordion-item';
          
          accordionItem.innerHTML = `
            <h2 class="accordion-header" id="dettaglio-heading-${giorno}">
              <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" 
                data-bs-toggle="collapse" data-bs-target="#dettaglio-collapse-${giorno}" 
                aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="dettaglio-collapse-${giorno}">
                ${label}
              </button>
            </h2>
            <div id="dettaglio-collapse-${giorno}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
              aria-labelledby="dettaglio-heading-${giorno}">
              <div class="accordion-body">
                <div class="mb-3">
                  <p class="fw-bold mb-1">Colazione:</p>
                  <p class="border-bottom pb-2">${contenuto[giorno].colazione || 'Non specificato'}</p>
                </div>
                <div class="mb-3">
                  <p class="fw-bold mb-1">Pranzo:</p>
                  <p class="border-bottom pb-2">${contenuto[giorno].pranzo || 'Non specificato'}</p>
                </div>
                <div>
                  <p class="fw-bold mb-1">Cena:</p>
                  <p>${contenuto[giorno].cena || 'Non specificato'}</p>
                </div>
              </div>
            </div>
          `;
          
          accordionContainer.appendChild(accordionItem);
          index++;
        }
      }
    }
  };
  
  // ===== Gestione impostazioni utente =====
  const impostazioniManager = {
    init() {
      // La validazione ora viene gestita completamente dal server con express-validator
      // e tramite gli attributi "required" nei campi del form
    }
  };

  // Inizializza solo i moduli necessari
  misurazioniManager.init();
  pianiAlimentariManager.init();
  impostazioniManager.init();
});
