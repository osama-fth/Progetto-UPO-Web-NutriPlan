document.addEventListener('DOMContentLoaded', function() {
  // ===== GESTIONE NAVIGAZIONE =====
  
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const sezioneId = this.getAttribute('data-section');
      
      document.querySelectorAll('.sezione-contenuto').forEach(sezione => {
        sezione.classList.add('d-none');
      });
      
      document.getElementById('sezione-' + sezioneId).classList.remove('d-none');
      
      document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
      });
      
      document.querySelectorAll(`.sidebar-link[data-section="${sezioneId}"]`).forEach(link => {
        link.parentElement.classList.add('active');
      });
      
      const sidebarMobile = document.getElementById('sidebar-mobile');
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarMobile);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    });
  });

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
      confermaMisurazioneCancella.href = `/misurazioni/cancella/${misurazioneId}`;
      
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
