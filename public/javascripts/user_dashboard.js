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
  const navigationManager = {
    init() {
      this.setupSidebarLinks();
      this.handleUrlHash();
    },

    setupSidebarLinks() {
      document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          const targetSection = this.getAttribute('data-section');
          window.location.hash = targetSection;
          
          document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
          });
          
          this.parentElement.classList.add('active');
          
          document.querySelectorAll('.sezione-contenuto').forEach(section => {
            section.classList.add('d-none');
          });
          
          document.getElementById(`sezione-${targetSection}`).classList.remove('d-none');
          
          const sidebarMobile = document.getElementById('sidebar-mobile');
          if (sidebarMobile) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarMobile);
            if (bsOffcanvas) {
              bsOffcanvas.hide();
            }
          }
        });
      });
    },
    
    handleUrlHash() {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const validSections = ['misurazioni', 'piani-alimentari', 'recensioni', 'impostazioni'];
        
        if (validSections.includes(hash)) {
          document.querySelectorAll('.sezione-contenuto').forEach(sezione => {
            sezione.classList.add('d-none');
          });
          
          document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
          });
          
          const sectionToShow = document.getElementById('sezione-' + hash);
          if (sectionToShow) {
            sectionToShow.classList.remove('d-none');
            
            document.querySelectorAll(`.sidebar-link[data-section="${hash}"]`).forEach(link => {
              link.parentElement.classList.add('active');
            });
          }
        }
      }
    }
  };
  
  // ===== Gestione misurazioni =====
  const misurazioniManager = {
    init() {
      this.setupDateInputDefault();
      this.setupModifyButtons();
      this.setupDeleteButton();
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
          
          uiUtils.showModal('misurazioneAzioniModal');
        });
      });
    },
    
    setupDeleteButton() {
      const btnEliminaMisurazione = document.getElementById('btnEliminaMisurazione');
      if (btnEliminaMisurazione) {
        btnEliminaMisurazione.addEventListener('click', function() {
          const misurazioneId = document.getElementById('misurazioneId').value;
          document.getElementById('confermaCancellazioneMisurazione').href = 
            `/user/misurazioni/elimina/${misurazioneId}`;
          
          uiUtils.hideModal('misurazioneAzioniModal');
          uiUtils.showModal('confermaCancellazioneMisurazioneModal');
        });
      }
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
        
        if (button.querySelector('i.fa-download')) {
          button.addEventListener('click', function() {
            const pianoId = this.getAttribute('data-piano-id');
            window.location.href = `/piani-alimentari/${pianoId}/download`;
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
      this.setupDeleteAccountButton();
    },
    
    setupDeleteAccountButton() {
      const btnEliminaAccount = document.getElementById('btnEliminaAccount');
      if (btnEliminaAccount) {
        btnEliminaAccount.addEventListener('click', function() {
          uiUtils.showModal('eliminaAccountModal');
        });
      }
    }
  };
  
  // ===== Gestione recensioni =====
  const recensioniManager = {
    init() {
      this.setupDeleteConfirmationModal();
    },
    
    setupDeleteConfirmationModal() {
      const modal = document.getElementById('confermaEliminaRecensioneModal');
      if (modal) {
        modal.addEventListener('show.bs.modal', function(event) {
          const button = event.relatedTarget;
          const recensioneId = button.getAttribute('data-recensione-id');
          document.getElementById('elimina-recensione-id').value = recensioneId;
        });
      }
    }
  };

  // Inizializza tutti i moduli
  navigationManager.init();
  misurazioniManager.init();
  pianiAlimentariManager.init();
  impostazioniManager.init();
  recensioniManager.init();
});
