document.addEventListener('DOMContentLoaded', function() {
  // Gestione click sui link della sidebar per cambiare sezione
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Rimuove la classe active da tutti i link
      sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
      
      // Aggiunge la classe active al link corrente
      this.parentElement.classList.add('active');
      
      // Nasconde tutte le sezioni
      const sections = document.querySelectorAll('.sezione-contenuto');
      sections.forEach(section => section.classList.add('d-none'));
      
      // Mostra la sezione corrente
      const sectionToShow = document.getElementById('sezione-' + this.dataset.section);
      if (sectionToShow) {
        sectionToShow.classList.remove('d-none');
      }
      
      // Chiude il sidebar mobile se aperto
      const sidebarMobile = document.getElementById('sidebar-mobile');
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarMobile);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    });
  });
  
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
