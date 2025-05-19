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
