document.addEventListener('DOMContentLoaded', function() {
  const setupSidebarLinks = () => {
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
  };
  
  const handleUrlHash = () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const validSections = ['pazienti', 'recensioni', 'richieste-contatto'];
      
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
  };
  
  setupSidebarLinks();
  handleUrlHash();
  
  document.querySelectorAll('.btn-dettagli-recensione').forEach(btn => {
    btn.addEventListener('click', function() {
      const nome = this.getAttribute('data-recensione-nome');
      const commento = this.getAttribute('data-recensione-commento');
      const data = this.getAttribute('data-recensione-data');
      
      document.getElementById('recensione-paziente').textContent = nome;
      document.getElementById('recensione-data').textContent = data;
      document.getElementById('recensione-commento').textContent = commento;
      
      const modal = new bootstrap.Modal(document.getElementById('recensioneDetailsModal'));
      modal.show();
    });
  });
  
  document.querySelectorAll('.btn-elimina-recensione').forEach(btn => {
    btn.addEventListener('click', function() {
      const recensioneId = this.getAttribute('data-recensione-id');
      document.getElementById('elimina-recensione-id').value = recensioneId;
      
      const modal = new bootstrap.Modal(document.getElementById('confermaEliminaRecensioneModal'));
      modal.show();
    });
  });
  
  document.querySelectorAll('.btn-dettagli-richiesta').forEach(btn => {
    btn.addEventListener('click', function() {
      const nome = this.getAttribute('data-richiesta-nome');
      const email = this.getAttribute('data-richiesta-email');
      const messaggio = this.getAttribute('data-richiesta-messaggio');
      const data = this.getAttribute('data-richiesta-data');
      
      document.getElementById('richiesta-nome').textContent = nome;
      document.getElementById('richiesta-email').textContent = email;
      document.getElementById('richiesta-data').textContent = data;
      document.getElementById('richiesta-messaggio').textContent = messaggio;
      
      const modal = new bootstrap.Modal(document.getElementById('richiestaDetailsModal'));
      modal.show();
    });
  });
  
  document.querySelectorAll('.btn-elimina-richiesta').forEach(btn => {
    btn.addEventListener('click', function() {
      const richiestaId = this.getAttribute('data-richiesta-id');
      document.getElementById('elimina-richiesta-id').value = richiestaId;
      
      const modal = new bootstrap.Modal(document.getElementById('confermaEliminaRichiestaModal'));
      modal.show();
    });
  });
  
  document.querySelectorAll('.btn-elimina-paziente').forEach(button => {
    button.addEventListener('click', function() {
      const pazienteId = this.getAttribute('data-paziente-id');
      document.getElementById('elimina-utente-id').value = pazienteId;
      const modal = new bootstrap.Modal(document.getElementById('confermaEliminaUtenteModal'));
      modal.show();
    });
  });
  
  document.querySelectorAll('button[data-paziente-id]').forEach(btn => {
    if (btn.querySelector('i.fa-eye')) {
      btn.addEventListener('click', function() {
        const pazienteId = this.getAttribute('data-paziente-id');
        const nome = this.getAttribute('data-paziente-nome');
        const cognome = this.getAttribute('data-paziente-cognome');
        const dataNascita = this.getAttribute('data-paziente-data-nascita');
        const email = this.getAttribute('data-paziente-email');
        
        document.getElementById('paziente-nome').textContent = nome;
        document.getElementById('paziente-cognome').textContent = cognome;
        document.getElementById('paziente-data-nascita').textContent = dataNascita;
        document.getElementById('paziente-email').textContent = email;
        
        const modal = new bootstrap.Modal(document.getElementById('pazienteDetailsModal'));
        modal.show();
        
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
              if (misurazioni && misurazioni.length > 0) {
                const labels = misurazioni.map(m => m.dataFormattata);
                const values = misurazioni.map(m => m.misura);
                
                try {
                  if (window.pazienteChart && typeof window.pazienteChart.destroy === 'function') {
                    window.pazienteChart.destroy();
                  }
                  window.pazienteChart = createWeightChart('pazienteChart', labels, values);
                } catch(e) {
                  console.error('Errore durante la creazione del grafico:', e);
                }
                
                const noChartData = document.querySelector('#pazienteDetailsModal #no-chart-data');
                if (noChartData) {
                  noChartData.style.display = 'none';
                }
              } else {
                const noChartData = document.querySelector('#pazienteDetailsModal #no-chart-data');
                if (noChartData) {
                  noChartData.style.display = 'block';
                }
                
                try {
                  if (window.pazienteChart && typeof window.pazienteChart.destroy === 'function') {
                    window.pazienteChart.destroy();
                  }
                  window.pazienteChart = createWeightChart('pazienteChart', [], []);
                } catch(e) {
                  console.error('Errore durante la creazione del grafico vuoto:', e);
                }
              }
            })
            .catch(error => {
              console.error('Errore nel caricamento delle misurazioni:', error);
              alert('Errore nel caricamento delle misurazioni. Controlla la console per i dettagli.');
              const noChartData = document.querySelector('#pazienteDetailsModal #no-chart-data');
              if (noChartData) {
                noChartData.style.display = 'block';
              }
            });
        }, { once: true });
      });
    }
  });
});
