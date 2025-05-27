function apriModalConfermaEliminazione(config) {
  // Recupera gli elementi del DOM
  const modal = document.getElementById('confermaEliminazioneModal');
  const form = document.getElementById('conferma-eliminazione-form');
  const inputId = document.getElementById('conferma-eliminazione-id');
  const inputNomeCampo = document.getElementById('conferma-eliminazione-nome-campo');
  const messaggioElement = document.getElementById('conferma-eliminazione-messaggio');
  
  if (!modal || !form || !inputId || !messaggioElement) {
    console.error('Elementi del modal di conferma eliminazione non trovati');
    return;
  }
  
  // Imposta il messaggio semplificato, sempre uguale
  messaggioElement.textContent = 'Sei sicuro?';
  
  // Imposta l'URL del form
  form.action = config.url;
  
  // Imposta il metodo (default: POST)
  form.method = config.method || 'POST';
  
  // Imposta l'ID dell'elemento
  inputId.value = config.itemId;
  
  // Imposta il nome del campo per l'ID (default: itemId)
  const nomeCampo = config.nomeCampo || 'itemId';
  inputId.name = nomeCampo;
  inputNomeCampo.value = nomeCampo;
  
  // Se è fornito un callback, lo aggiungiamo all'evento submit del form
  if (typeof config.callback === 'function') {
    const handleSubmit = function(e) {
      e.preventDefault();
      config.callback();
      form.removeEventListener('submit', handleSubmit);
      
      // Chiudi il modal dopo l'esecuzione del callback
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    };
    
    form.addEventListener('submit', handleSubmit);
  }
  
  // Apri il modal
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

// Inizializza gli eventi quando il DOM è pronto
document.addEventListener('DOMContentLoaded', function() {
  // Setup per tutti i pulsanti di eliminazione che usano l'attributo data-elimina
  document.addEventListener('click', function(e) {
    const button = e.target.closest('[data-elimina]');
    
    if (!button) return;
    
    e.preventDefault();
    
    const tipo = button.getAttribute('data-elimina');
    const itemId = button.getAttribute('data-item-id');
    
    // Configurazioni predefinite per diversi tipi di eliminazione
    const configurazioni = {
      'recensione': {
        url: window.location.pathname.includes('/admin') ? '/admin/recensioni/elimina' : '/user/recensioni/cancella',
        nomeCampo: 'recensioneId'
      },
      'misurazione': {
        url: `/user/misurazioni/elimina/${itemId}`,
        method: 'GET'
      },
      'richiesta': {
        url: '/admin/contatti/elimina',
        nomeCampo: 'richiestaId'
      },
      'utente': {
        url: '/admin/utenti/elimina',
        nomeCampo: 'utenteId'
      },
      'piano': {
        url: '/admin/piani-alimentari/elimina',
        nomeCampo: 'pianoId'
      },
      'account': {
        url: '/user/account/elimina',
        method: 'GET'
      }
    };
    
    // Se il tipo esiste nelle configurazioni predefinite
    if (configurazioni[tipo]) {
      const config = {
        ...configurazioni[tipo],
        itemId: itemId
      };
      
      apriModalConfermaEliminazione(config);
    } else {
      console.error(`Tipo di eliminazione '${tipo}' non supportato`);
    }
  });
});
