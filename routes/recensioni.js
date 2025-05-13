const express = require('express');
const router = express.Router();
const dao = require('../models/dao');
const authMiddleware = require("../middleware/auth");

/* GET pagina recensioni */
router.get('/', async (req, res) => {
  try {
    const recensioni = await dao.getAllRecensioni();
    
    res.render('pages/recensioni', {
      title: 'Recensioni - NutriPlan',
      recensioni,
      user: req.user || null,
      isAuth: req.isAuthenticated()
    });
  } catch (error) {
    console.error('Errore durante il recupero delle recensioni:', error);
    res.redirect('/error?message=Errore+durante+il+recupero+delle+recensioni');
  }
});

// POST aggiungi recensione
router.post('/nuova', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { commento } = req.body;
    
    if (!commento || commento.trim() === '') {
      // Mostra errore nella pagina utente_dashboard
      return res.render('pages/utente_dashboard', { 
        user: req.user,
        isAuth: req.isAuthenticated(),
        misurazioni: await dao.getMisurazioniByUserId(req.user.id),
        recensione: await dao.getRecensioneByUserId(req.user.id),
        pianiAlimentari: await dao.getPianiAlimentariByUserId(req.user.id),
        error: 'Il testo della recensione non può essere vuoto.'
      });
    }

    await dao.insertRecensione(req.user.id, commento.trim());
    
    // Reindirizza alla pagina utente_dashboard con messaggio di successo
    req.session.success = 'Recensione pubblicata con successo.';
    res.redirect('/utenteDashboard');
  } catch (error) {
    console.error('Errore durante l\'aggiunta della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/utenteDashboard');
  }
});

// Cancella recensione
router.post('/cancella', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await dao.deleteRecensione(recensioneId);
    
    req.session.success = 'Recensione eliminata con successo.';
    res.redirect('/utenteDashboard');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/utenteDashboard');
  }
});

module.exports = router;
