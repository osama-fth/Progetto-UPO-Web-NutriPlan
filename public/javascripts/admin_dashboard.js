document.addEventListener('DOMContentLoaded', function() {
  // ===== Utility per UI =====
  const uiUtils = {
    showModal(modalId) {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.error(`Modal con ID ${modalId} non trovato`);
        return;
      }
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    },
    
    hideModal(modalId) {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) {
        console.error(`Modal con ID ${modalId} non trovato`);
        return;
      }
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
    },
    
    setModalData(dataMap, sourceObj) {
      Object.entries(dataMap).forEach(([key, id]) => {
        if (sourceObj[key] && document.getElementById(id)) {
          document.getElementById(id).textContent = sourceObj[key];
        }
      });
    },
    
    today() {
      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1;
      let dd = today.getDate();
      
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      
      return yyyy + '-' + mm + '-' + dd;
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
          
          document.querySelectorAll('.sezione-contenuto').forEach(section => {
            section.classList.add('d-none');
          });
          
          document.getElementById(`sezione-${targetSection}`).classList.remove('d-none');
          
          document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
          });
          this.parentElement.classList.add('active');
        });
      });
    },
    
    handleUrlHash() {
      const hash = window.location.hash.substring(1);
      const validSections = ['pazienti', 'recensioni', 'richieste-contatto'];
      
      if (hash && validSections.includes(hash)) {
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
  };

  // ===== Gestione recensioni =====
  const recensioniManager = {
    init() {
      // Non è più necessario setupDetailButtons poiché i dettagli sono già visibili nell'accordion
      // Ora gestiremo solo la cancellazione delle recensioni attraverso gli attributi data-*
      console.log("Inizializzazione gestione recensioni");
    }
  };

  // ===== Gestione richieste di contatto =====
  const richiesteManager = {
    init() {
      // Non è più necessario setupDetailButtons poiché i dettagli sono già visibili nell'accordion
      // Ora gestiremo solo la cancellazione delle richieste attraverso gli attributi data-*
      console.log("Inizializzazione gestione richieste di contatto");
    }
  };
  
  // ===== Gestione pazienti =====
  const pazientiManager = {
    init() {
      this.setupDetailButtons();
      // Rimosso setupDeleteButtons() perché ora è gestito dal nuovo componente
    },
    
    setupDetailButtons() {
      document.querySelectorAll('button[data-paziente-id]').forEach(btn => {
        if (btn.querySelector('i.fa-eye')) {
          btn.addEventListener('click', function() {
            const pazienteId = this.getAttribute('data-paziente-id');
            const data = {
              nome: this.getAttribute('data-paziente-nome'),
              cognome: this.getAttribute('data-paziente-cognome'),
              dataNascita: this.getAttribute('data-paziente-data-nascita'),
              email: this.getAttribute('data-paziente-email')
            };
            
            uiUtils.setModalData({
              nome: 'paziente-nome',
              cognome: 'paziente-cognome',
              dataNascita: 'paziente-data-nascita',
              email: 'paziente-email'
            }, data);
            
            uiUtils.showModal('pazienteDetailsModal');
            pazientiManager.loadMisurazioni(pazienteId);
          });
        }
      });
    },
    
    loadMisurazioni(pazienteId) {
      document.getElementById('pazienteDetailsModal').addEventListener('shown.bs.modal', function loadMisurazioni() {
        document.getElementById('pazienteDetailsModal').removeEventListener('shown.bs.modal', loadMisurazioni);
        
        fetch(`/admin/pazienti/${pazienteId}/misurazioni`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Errore nella risposta: ${response.status} ${response.statusText}`);
            }
            return response.json();
          })
          .then(misurazioni => {
            pazientiManager.renderChart(misurazioni);
          })
          .catch(error => {
            console.error('Errore nel caricamento delle misurazioni:', error);
            alert('Errore nel caricamento delle misurazioni. Controlla la console per i dettagli.');
            pazientiManager.showNoData();
          });
      }, { once: true });
    },
    
    renderChart(misurazioni) {
      const noChartData = document.querySelector('#pazienteDetailsModal #no-chart-data');
      this.destroyExistingChart();
      
      if (misurazioni && misurazioni.length > 0) {
        const labels = misurazioni.map(m => m.dataFormattata);
        const values = misurazioni.map(m => m.misura);
        
        window.pazienteChart = createWeightChart('pazienteChart', labels, values);
        if (noChartData) noChartData.style.display = 'none';
      } else {
        window.pazienteChart = createWeightChart('pazienteChart', [], []);
        this.showNoData();
      }
    },
    
    showNoData() {
      const noChartData = document.querySelector('#pazienteDetailsModal #no-chart-data');
      if (noChartData) noChartData.style.display = 'block';
    },
    
    destroyExistingChart() {
      try {
        if (window.pazienteChart && typeof window.pazienteChart.destroy === 'function') {
          window.pazienteChart.destroy();
        }
      } catch(e) {
        console.error('Errore durante la distruzione del grafico:', e);
      }
    }
  };

  // ===== Gestione piani alimentari =====
  const pianiAlimentariManager = {
    currentPazienteId: null,
    currentPazienteNome: '',
    
    init() {
      this.setupPianiButtons();
      this.setupNuovoPianoButton();
      this.setupFormSubmit();
    },
    
    setupPianiButtons() {
      document.querySelectorAll('.btn-piani-paziente').forEach(btn => {
        btn.addEventListener('click', () => {
          const pazienteId = btn.getAttribute('data-paziente-id');
          const nome = btn.getAttribute('data-paziente-nome');
          const cognome = btn.getAttribute('data-paziente-cognome');
          
          this.currentPazienteId = pazienteId;
          this.currentPazienteNome = `${nome} ${cognome}`;
          
          document.getElementById('piani-paziente-nome').textContent = this.currentPazienteNome;
          document.getElementById('piano-utente-id').value = this.currentPazienteId;
          
          this.loadPianiAlimentari(pazienteId);
          uiUtils.showModal('pianiAlimentariModal');
        });
      });
    },
    
    setupNuovoPianoButton() {
      // Utilizziamo la delega degli eventi invece di cercare direttamente il pulsante
      document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'btn-nuovo-piano' || 
            (e.target.closest && e.target.closest('#btn-nuovo-piano'))) {
          console.log('Click sul bottone nuovo piano');
          
          // Resetta il form
          document.getElementById('nuovoPianoForm').reset();
          
          // Imposta la data odierna
          document.getElementById('piano-data').value = uiUtils.today();
          
          // Chiudi il modal corrente
          const pianiModal = document.getElementById('pianiAlimentariModal');
          const bsPianiModal = bootstrap.Modal.getInstance(pianiModal);
          if (bsPianiModal) bsPianiModal.hide();
          
          // Mostra il nuovo modal
          const nuovoPianoModal = new bootstrap.Modal(document.getElementById('nuovoPianoModal'));
          nuovoPianoModal.show();
        }
      });
    },
    
    setupFormSubmit() {
      // Aggiungiamo l'event listener al pulsante invece che al form
      document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'salva-piano-btn') {
          e.preventDefault();
          
          const form = document.getElementById('nuovoPianoForm');
          if (!form) {
            console.error('Form non trovato');
            return;
          }
          
          const formData = new FormData(form);
          const pianoData = {
            utenteId: formData.get('utenteId'),
            titolo: formData.get('titolo'),
            descrizione: formData.get('descrizione'),
            data: formData.get('data'),
            contenuto: this.createPianoContenutoJSON(formData)
          };
          
          // Controllo dati
          if (!pianoData.utenteId || !pianoData.titolo || !pianoData.data) {
            alert('Compila tutti i campi obbligatori');
            return;
          }
          
          // Invia i dati
          fetch('/admin/piani-alimentari/nuovo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(pianoData)
          })
          .then(response => {
            if (!response.ok) throw new Error('Errore nella creazione del piano');
            return response.json();
          })
          .then(data => {
            // Chiudi il modal
            const nuovoPianoModal = bootstrap.Modal.getInstance(document.getElementById('nuovoPianoModal'));
            if (nuovoPianoModal) nuovoPianoModal.hide();
            
            // Ricarica i dati e riapri il modal principale
            this.loadPianiAlimentari(this.currentPazienteId);
            
            setTimeout(() => {
              const pianiAlimentariModal = new bootstrap.Modal(document.getElementById('pianiAlimentariModal'));
              pianiAlimentariModal.show();
            }, 500);
          })
          .catch(error => {
            console.error('Errore:', error);
            alert('Si è verificato un errore durante il salvataggio del piano alimentare');
          });
        }
      });
    },
    
    createPianoContenutoJSON(formData) {
      const giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
      const contenuto = {};
      
      giorni.forEach(giorno => {
        contenuto[giorno] = {
          colazione: formData.get(`${giorno}_colazione`) || '',
          pranzo: formData.get(`${giorno}_pranzo`) || '',
          cena: formData.get(`${giorno}_cena`) || ''
        };
      });
      
      return JSON.stringify(contenuto);
    },
    
    loadPianiAlimentari(pazienteId) {
      fetch(`/admin/pazienti/${pazienteId}/piani-alimentari`)
        .then(response => {
          if (!response.ok) throw new Error(`Errore nella risposta: ${response.status}`);
          return response.json();
        })
        .then(piani => {
          this.renderPianiAlimentari(piani);
        })
        .catch(error => {
          console.error('Errore nel caricamento dei piani alimentari:', error);
          this.showNoPiani();
        });
    },
    
    renderPianiAlimentari(piani) {
      const tableBody = document.getElementById('piani-alimentari-table-body');
      const noPianiRow = document.getElementById('no-piani-row');
      
      // Pulisci la tabella ma mantieni la riga "nessun piano"
      while (tableBody.firstChild) {
        if (tableBody.firstChild === noPianiRow) break;
        tableBody.removeChild(tableBody.firstChild);
      }
      
      if (piani && piani.length > 0) {
        noPianiRow.style.display = 'none';
        
        piani.forEach(piano => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td class="text-center">${piano.titolo}</td>
            <td class="text-center">${piano.dataFormattata}</td>
            <td class="text-center">
              <div class="d-flex justify-content-center">
                <button type="button" class="btn btn-sm btn-outline-primary me-2 btn-visualizza-piano" 
                  data-piano-id="${piano.id}" data-piano-titolo="${piano.titolo}" data-piano-data="${piano.dataFormattata}"
                  data-piano-descrizione="${piano.descrizione || ''}">
                  <i class="fas fa-eye me-1"></i> Visualizza
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger btn-elimina-piano"
                  data-piano-id="${piano.id}">
                  <i class="fas fa-trash me-1"></i> Elimina
                </button>
              </div>
            </td>
          `;
          
          tableBody.insertBefore(row, noPianiRow);
        });
        
        this.setupDettaglioPianoButtons();
        this.setupDeletePianoButtons();
      } else {
        noPianiRow.style.display = '';
      }
    },
    
    showNoPiani() {
      document.getElementById('no-piani-row').style.display = '';
    },
    
    setupDettaglioPianoButtons() {
      document.querySelectorAll('.btn-visualizza-piano').forEach(btn => {
        btn.addEventListener('click', () => {
          const pianoId = btn.getAttribute('data-piano-id');
          const titolo = btn.getAttribute('data-piano-titolo');
          const data = btn.getAttribute('data-piano-data');
          const descrizione = btn.getAttribute('data-piano-descrizione');
          
          document.getElementById('dettaglio-piano-titolo').textContent = titolo;
          document.getElementById('dettaglio-piano-data').textContent = `Data: ${data}`;
          document.getElementById('dettaglio-piano-paziente').textContent = `Paziente: ${this.currentPazienteNome}`;
          document.getElementById('dettaglio-piano-descrizione').textContent = descrizione || 'Nessuna descrizione disponibile.';
          
          fetch(`/admin/piani-alimentari/${pianoId}`)
            .then(response => {
              if (!response.ok) throw new Error(`Errore nella risposta: ${response.status}`);
              return response.json();
            })
            .then(piano => {
              this.renderDettaglioPiano(piano.contenuto);
              uiUtils.hideModal('pianiAlimentariModal');
              uiUtils.showModal('visualizzaPianoModal');
            })
            .catch(error => {
              console.error('Errore nel caricamento del piano:', error);
              alert('Errore nel caricamento dei dettagli del piano alimentare');
            });
        });
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
    },
    
    setupDeletePianoButtons() {
      document.querySelectorAll('.btn-elimina-piano').forEach(btn => {
        btn.addEventListener('click', function() {
          const pianoId = this.getAttribute('data-piano-id');
          
          // Utilizziamo il sistema di conferma eliminazione centralizzato
          const btnElimina = document.createElement('button');
          btnElimina.setAttribute('data-elimina', 'piano');
          btnElimina.setAttribute('data-item-id', pianoId);
          document.body.appendChild(btnElimina);
          btnElimina.click();
          document.body.removeChild(btnElimina);
        });
      });
    }
  };

  // Inizializza tutti i moduli
  navigationManager.init();
  recensioniManager.init();
  richiesteManager.init();
  pazientiManager.init();
  pianiAlimentariManager.init();
});
