document.addEventListener('DOMContentLoaded', function() {
  // ===== Utility per UI =====
  const uiUtils = {
    showModal(modalId) {
      const modal = new bootstrap.Modal(document.getElementById(modalId));
      modal.show();
      return modal;
    },
    
    setModalData(dataMap, sourceObj) {
      Object.entries(dataMap).forEach(([key, id]) => {
        if (sourceObj[key] && document.getElementById(id)) {
          document.getElementById(id).textContent = sourceObj[key];
        }
      });
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
      this.setupDetailButtons();
      this.setupDeleteButtons();
    },
    
    setupDetailButtons() {
      document.querySelectorAll('.btn-dettagli-recensione').forEach(btn => {
        btn.addEventListener('click', function() {
          const data = {
            nome: this.getAttribute('data-recensione-nome'),
            commento: this.getAttribute('data-recensione-commento'),
            data: this.getAttribute('data-recensione-data')
          };
          
          uiUtils.setModalData({
            nome: 'recensione-paziente',
            commento: 'recensione-commento',
            data: 'recensione-data'
          }, data);
          
          uiUtils.showModal('recensioneDetailsModal');
        });
      });
    },
    
    setupDeleteButtons() {
      document.querySelectorAll('.btn-elimina-recensione').forEach(btn => {
        btn.addEventListener('click', function() {
          const recensioneId = this.getAttribute('data-recensione-id');
          document.getElementById('elimina-recensione-id').value = recensioneId;
          uiUtils.showModal('confermaEliminaRecensioneModal');
        });
      });
    }
  };

  // ===== Gestione richieste di contatto =====
  const richiesteManager = {
    init() {
      this.setupDetailButtons();
      this.setupDeleteButtons();
    },
    
    setupDetailButtons() {
      document.querySelectorAll('.btn-dettagli-richiesta').forEach(btn => {
        btn.addEventListener('click', function() {
          const data = {
            nome: this.getAttribute('data-richiesta-nome'),
            email: this.getAttribute('data-richiesta-email'),
            messaggio: this.getAttribute('data-richiesta-messaggio'),
            data: this.getAttribute('data-richiesta-data')
          };
          
          uiUtils.setModalData({
            nome: 'richiesta-nome',
            email: 'richiesta-email',
            data: 'richiesta-data',
            messaggio: 'richiesta-messaggio'
          }, data);
          
          uiUtils.showModal('richiestaDetailsModal');
        });
      });
    },
    
    setupDeleteButtons() {
      document.querySelectorAll('.btn-elimina-richiesta').forEach(btn => {
        btn.addEventListener('click', function() {
          const richiestaId = this.getAttribute('data-richiesta-id');
          document.getElementById('elimina-richiesta-id').value = richiestaId;
          uiUtils.showModal('confermaEliminaRichiestaModal');
        });
      });
    }
  };
  
  // ===== Gestione pazienti =====
  const pazientiManager = {
    init() {
      this.setupDetailButtons();
      this.setupDeleteButtons();
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
    
    setupDeleteButtons() {
      document.querySelectorAll('.btn-elimina-paziente').forEach(btn => {
        btn.addEventListener('click', function() {
          const pazienteId = this.getAttribute('data-paziente-id');
          document.getElementById('elimina-utente-id').value = pazienteId;
          uiUtils.showModal('confermaEliminaUtenteModal');
        });
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

  // Inizializza tutti i moduli
  navigationManager.init();
  recensioniManager.init();
  richiesteManager.init();
  pazientiManager.init();
});
