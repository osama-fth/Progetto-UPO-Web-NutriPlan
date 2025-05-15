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
  
  // Inizializza i link della sidebar
  setupSidebarLinks();
  
  // Gestisci l'hash URL al caricamento della pagina
  handleUrlHash();
  
  // Gestione click sui pulsanti dettagli recensione
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
  
  // Gestione click sui pulsanti elimina recensione
  document.querySelectorAll('.btn-elimina-recensione').forEach(btn => {
    btn.addEventListener('click', function() {
      const recensioneId = this.getAttribute('data-recensione-id');
      document.getElementById('elimina-recensione-id').value = recensioneId;
      
      const modal = new bootstrap.Modal(document.getElementById('confermaEliminaRecensioneModal'));
      modal.show();
    });
  });
  
  // Gestione click sui pulsanti dettagli richiesta
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
  
  // Gestione click sui pulsanti elimina richiesta
  document.querySelectorAll('.btn-elimina-richiesta').forEach(btn => {
    btn.addEventListener('click', function() {
      const richiestaId = this.getAttribute('data-richiesta-id');
      document.getElementById('elimina-richiesta-id').value = richiestaId;
      
      const modal = new bootstrap.Modal(document.getElementById('confermaEliminaRichiestaModal'));
      modal.show();
    });
  });
  
  // Gestione pulsanti eliminazione pazienti
  document.querySelectorAll('.btn-elimina-paziente').forEach(button => {
    button.addEventListener('click', function() {
      const pazienteId = this.getAttribute('data-paziente-id');
      
      // Imposta l'ID utente nel form di eliminazione
      document.getElementById('elimina-utente-id').value = pazienteId;
      
      // Mostra il modal di conferma
      const modal = new bootstrap.Modal(document.getElementById('confermaEliminaUtenteModal'));
      modal.show();
    });
  });
});
