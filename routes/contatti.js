const express = require('express');
const router = express.Router();
const dao = require('../models/dao');
const { check, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');

/* POST invia messaggio di contatto */
router.post('/invia', [
  check('nome').notEmpty().withMessage('Il nome è obbligatorio'),
  check('email').notEmpty().withMessage('L\'email è obbligatoria').isEmail().withMessage('Inserire un indirizzo email valido'),
  check('messaggio').notEmpty().withMessage('Il messaggio è obbligatorio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect(`/?alert=errore&errorType=campi_mancanti#contatti`);
    }
    
    const { nome, email, messaggio } = req.body;
    await dao.inserisciRichiestaContatto(nome, email, messaggio);

    res.redirect('/?alert=success&message=messaggio_inviato#contatti');
  } catch (error) {
    console.error('Errore durante l\'invio del messaggio di contatto:', error);
    res.redirect('/?alert=errore&errorType=errore_generico#contatti');
  }
});

// Elimina richiesta di contatto
router.post('/elimina-richiesta', authMiddleware.isAdmin, async (req, res) => {
  try {
    const { richiestaId } = req.body;
    
    await dao.deleteRichiestaContatto(richiestaId);
    
    req.session.success = 'Richiesta di contatto eliminata con successo.';
    res.redirect('/adminDashboard#richieste-contatto');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della richiesta di contatto:', error);
    req.session.error = 'Errore durante l\'eliminazione della richiesta di contatto.';
    res.redirect('/adminDashboard#richieste-contatto');
  }
});

module.exports = router;
