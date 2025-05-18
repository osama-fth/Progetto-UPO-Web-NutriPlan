document.addEventListener('DOMContentLoaded', function() {
  const setupSidebarLinks = () => {
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
  };
  
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
  
  setupSidebarLinks();
  handleUrlHash();
  
  const dataInput = document.getElementById('data');
  if (dataInput) {
    const oggi = new Date();
    const anno = oggi.getFullYear();
    const mese = String(oggi.getMonth() + 1).padStart(2, '0');
    const giorno = String(oggi.getDate()).padStart(2, '0');
    dataInput.value = `${anno}-${mese}-${giorno}`;
  }
  
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
      document.getElementById('confermaCancellazioneMisurazione').href = `/user/misurazioni/elimina/${misurazioneId}`;
      
      const misurazioneModal = bootstrap.Modal.getInstance(document.getElementById('misurazioneAzioniModal'));
      misurazioneModal.hide();
      
      const confermaModal = new bootstrap.Modal(document.getElementById('confermaCancellazioneMisurazioneModal'));
      confermaModal.show();
    });
  }

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

  const btnEliminaAccount = document.getElementById('btnEliminaAccount');
  if (btnEliminaAccount) {
    btnEliminaAccount.addEventListener('click', function() {
      const eliminaAccountModal = new bootstrap.Modal(document.getElementById('eliminaAccountModal'));
      eliminaAccountModal.show();
    });
  }
  
  document.getElementById('confermaEliminaRecensioneModal').addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    const recensioneId = button.getAttribute('data-recensione-id');
    document.getElementById('elimina-recensione-id').value = recensioneId;
  });
});
