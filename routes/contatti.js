const express = require('express');
const router = express.Router();
const dao = require('../models/dao');
const { check, validationResult } = require('express-validator');

/* POST invia messaggio di contatto */
router.post('/invia', [
  check('nome').notEmpty().withMessage('Il nome è obbligatorio'),
  check('email')
    .notEmpty().withMessage('L\'email è obbligatoria')
    .isEmail().withMessage('Inserire un indirizzo email valido'),
  check('messaggio').notEmpty().withMessage('Il messaggio è obbligatorio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorType = errors.array()[0].param === 'email' ? 'email_non_valida' : 'campi_mancanti';
      return res.redirect(`/?alert=errore&errorType=${errorType}#contatti`);
    }
    
    const { nome, email, messaggio } = req.body;
    await dao.inserisciRichiestaContatto(nome, email, messaggio);

    res.redirect('/?messaggioInviato=true#contatti');
  } catch (error) {
    console.error('Errore durante l\'invio del messaggio di contatto:', error);
    res.redirect('/?alert=errore&errorType=errore_generico#contatti');
  }
});

module.exports = router;
