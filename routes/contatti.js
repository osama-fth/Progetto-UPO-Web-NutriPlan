const express = require('express');
const router = express.Router();
const dao = require('../models/dao');

/* POST invia messaggio di contatto */
router.post('/invia', async (req, res) => {
  try {
    const { nome, email, messaggio } = req.body;
    
    // Validazione
    if (!nome || !email || !messaggio) {
      return res.redirect('/?alert=errore&errorType=campi_mancanti#contatti');
    }
    
    // Validazione email con regex semplice
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.redirect('/?alert=errore&errorType=email_non_valida#contatti');
    }
    
    // Inserisci nel database
    await dao.inserisciRichiestaContatto(nome, email, messaggio);
    
    // Reindirizza con messaggio di successo
    res.redirect('/?messaggioInviato=true#contatti');
  } catch (error) {
    console.error('Errore durante l\'invio del messaggio di contatto:', error);
    res.redirect('/?alert=errore&errorType=errore_generico#contatti');
  }
});

module.exports = router;
