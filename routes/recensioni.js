const express = require('express');
const router = express.Router();
const recensioniDAO = require('../models/daos/recensioniDAO');
const authMiddleware = require("../middleware/auth");

/* GET pagina recensioni */
router.get('/', async (req, res) => {
  try {
    const recensioni = await recensioniDAO.getAllRecensioni();
  
    res.render('pages/recensioni', {
      title: ' NutriPlan - Recensioni',
      recensioni,
      user: req.user || null,
      isAuth: req.isAuthenticated(),
    });
  } catch (error) {
    console.error('Errore durante il recupero delle recensioni:', error);
    req.session.error = "Errore durante il recupero delle recensioni";
    res.redirect("/error");
  }
});

// POST aggiungi recensione
router.post('/nuova', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { commento } = req.body;
    
    if (!commento || commento.trim() === '') {
      // Usa req.session.error invece di renderizzare direttamente
      req.session.error = 'Il testo della recensione non può essere vuoto.';
      return res.redirect('/utenteDashboard#recensione'); // Aggiunto anchor per portare l'utente alla sezione recensioni
    }

    await recensioniDAO.insertRecensione(req.user.id, commento.trim());
    
    // Reindirizza alla pagina utente_dashboard con messaggio di successo
    req.session.success = 'Recensione pubblicata con successo.';
    res.redirect('/utenteDashboard#recensione');
  } catch (error) {
    console.error('Errore durante l\'aggiunta della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/utenteDashboard#recensione');
  }
});

// Cancella recensione
router.post('/cancella', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await recensioniDAO.deleteRecensione(recensioneId);
    
    req.session.success = 'Recensione eliminata con successo.';
    res.redirect('/utenteDashboard#recensione');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/utenteDashboard#recensione');
  }
});

// Elimina recensione dall'admin dashboard
router.post('/elimina-admin', authMiddleware.isAdmin, async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await recensioniDAO.deleteRecensione(recensioneId);
    
    req.session.success = 'Recensione eliminata con successo.';
    res.redirect('/adminDashboard#recensioni');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.session.error = 'Errore durante l\'eliminazione della recensione.';
    res.redirect('/adminDashboard#recensioni');
  }
});

module.exports = router;
