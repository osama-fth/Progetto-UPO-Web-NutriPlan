const express = require('express');
const router = express.Router();
const recensioniDAO = require('../models/daos/recensioniDAO');
const authMiddleware = require("../middleware/auth");

/* GET pagina recensioni */
router.get('/', async (req, res) => {

  const success = req.session.success;
  const error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  try {
    const recensioni = await recensioniDAO.getAllRecensioni();
    
    res.render('pages/recensioni', {
      title: ' NutriPlan - Recensioni',
      recensioni,
      user: req.user || null,
      isAuth: req.isAuthenticated(),
      success: success, 
      error: error      
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
      req.session.error = 'Il testo della recensione non può essere vuoto.';
      return res.redirect('/utenteDashboard#recensioni');
    }

    await recensioniDAO.insertRecensione(req.user.id, commento.trim());
    
    req.session.success = 'Recensione pubblicata con successo.';
    res.redirect('/utenteDashboard#recensioni');
  } catch (error) {
    console.error('Errore durante l\'aggiunta della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/utenteDashboard#recensioni');
  }
});

// Cancella recensione
router.post('/cancella', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await recensioniDAO.deleteRecensione(recensioneId);
    
    req.session.success = 'Recensione eliminata con successo.';
    res.redirect('/utenteDashboard#recensioni');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/utenteDashboard#recensioni');
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
