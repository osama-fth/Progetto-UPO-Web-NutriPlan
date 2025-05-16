document.addEventListener('DOMContentLoaded', function() {
  // Funzione per gestire il click sui link della sidebar
  const setupSidebarLinks = () => {
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Ottieni la sezione target dal data-attribute
        const targetSection = this.getAttribute('data-section');
        
        // Aggiorna l'URL con il hash
        window.location.hash = targetSection;
        
        // Nascondi tutte le sezioni
        document.querySelectorAll('.sezione-contenuto').forEach(section => {
          section.classList.add('d-none');
        });
        
        // Mostra la sezione cliccata
        document.getElementById(`sezione-${targetSection}`).classList.remove('d-none');
        
        // Aggiorna lo stato attivo nella sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
          item.classList.remove('active');
        });
        this.parentElement.classList.add('active');
      });
    });
  };
  
  // Gestione del fragment URL al caricamento della pagina (codice che hai già aggiunto)
  const handleUrlHash = () => {
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
  };
  
  // Inizializza i link della sidebar
  setupSidebarLinks();
  
  // Gestisci l'hash URL al caricamento della pagina
  handleUrlHash();
  
  // ===== GESTIONE MISURAZIONI =====
  
  document.querySelectorAll('.btn-modifica-misurazione').forEach(button => {
    button.addEventListener('click', function() {
      const misurazioneId = this.getAttribute('data-misurazione-id');
      const peso = this.getAttribute('data-peso');
      const data = this.getAttribute('data-data');
      
      document.getElementById('misurazioneId').value = misurazioneId;
      document.getElementById('pesoModifica').value = peso;
      document.getElementById('dataModifica').value = data;
      
      const modal = new bootstrap.Modal(document.getElementById('misurazioneAzioniModal'));
      modal.show();
    });
  });
  
  const btnEliminaMisurazione = document.getElementById('btnEliminaMisurazione');
  if (btnEliminaMisurazione) {
    btnEliminaMisurazione.addEventListener('click', function() {
      const misurazioneId = document.getElementById('misurazioneId').value;
      const confermaMisurazioneCancella = document.getElementById('confermaCancellazioneMisurazione');
      confermaMisurazioneCancella.href = `/user/misurazioni/cancella/${misurazioneId}`;
      
      bootstrap.Modal.getInstance(document.getElementById('misurazioneAzioniModal')).hide();
      
      const modalConferma = new bootstrap.Modal(document.getElementById('confermaCancellazioneMisurazioneModal'));
      modalConferma.show();
    });
  }

  // ===== GESTIONE PIANI ALIMENTARI =====
  
  document.querySelectorAll('[data-piano-id]').forEach(button => {
    if (button.querySelector('i.fa-eye')) {
      button.addEventListener('click', function() {
        const pianoId = this.getAttribute('data-piano-id');
        window.location.href = `/piani-alimentari/${pianoId}`;
      });
    }
    
    if (button.querySelector('i.fa-download')) {
      button.addEventListener('click', function() {
        const pianoId = this.getAttribute('data-piano-id');
        window.location.href = `/piani-alimentari/${pianoId}/download`;
      });
    }
  });

  // ===== GESTIONE ELIMINAZIONE ACCOUNT =====
  const btnEliminaAccount = document.getElementById('btnEliminaAccount');
  if (btnEliminaAccount) {
    btnEliminaAccount.addEventListener('click', function() {
      const eliminaAccountModal = new bootstrap.Modal(document.getElementById('eliminaAccountModal'));
      eliminaAccountModal.show();
    });
  }
});
