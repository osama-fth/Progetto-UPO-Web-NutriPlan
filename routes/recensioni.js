const express = require('express');
const router = express.Router();
const dao = require('../models/dao');

/* GET pagina recensioni */
router.get('/', async (req, res) => {
  try {
    const recensioni = await dao.getAllRecensioni();
    
    res.render('pages/recensioni', {
      title: 'Recensioni - NutriPlan',
      recensioni,
      user: req.user || null
    });
  } catch (error) {
    console.error('Errore durante il recupero delle recensioni:', error);
    res.redirect('/error?message=Errore+durante+il+recupero+delle+recensioni');
  }
});

/* POST aggiungi recensione */
router.post('/nuova', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect('/login?alert=errore&errorType=non_autorizzato');
  }

  try {
    const { commento } = req.body;
    
    // Validazione
    if (!commento || commento.trim() === '') {
      return res.status(400).redirect('/utenteDashboard?alert=errore&errorType=recensione_vuota');
    }

    // Verifica se l'utente ha già una recensione
    const recensioneEsistente = await dao.getRecensioneByUserId(req.user.id);
    if (recensioneEsistente) {
      return res.status(400).redirect('/utenteDashboard?alert=errore&errorType=recensione_esistente');
    }

    // Inserimento della recensione
    await dao.insertRecensione(req.user.id, commento.trim());
    
    res.redirect('/utenteDashboard?alert=successo&successType=recensione_aggiunta');
  } catch (error) {
    console.error('Errore durante l\'aggiunta della recensione:', error);
    res.redirect('/utenteDashboard?alert=errore&errorType=recensione_errore');
  }
});

/* POST modifica recensione */
router.post('/modifica', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect('/login?alert=errore&errorType=non_autorizzato');
  }

  try {
    const { recensioneId, commento } = req.body;
    
    // Validazione
    if (!commento || commento.trim() === '') {
      return res.status(400).redirect('/utenteDashboard?alert=errore&errorType=recensione_vuota');
    }

    // Verifica se la recensione esiste e appartiene all'utente loggato
    const recensione = await dao.getRecensioneById(recensioneId);
    if (!recensione || recensione.utente_id !== req.user.id) {
      return res.status(403).redirect('/utenteDashboard?alert=errore&errorType=non_autorizzato');
    }

    // Aggiornamento della recensione
    await dao.updateRecensione(recensioneId, commento.trim());
    
    res.redirect('/utenteDashboard?alert=successo&successType=recensione_modificata');
  } catch (error) {
    console.error('Errore durante la modifica della recensione:', error);
    res.redirect('/utenteDashboard?alert=errore&errorType=recensione_errore');
  }
});

/* GET cancella recensione */
router.get('/cancella', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).redirect('/login?alert=errore&errorType=non_autorizzato');
  }

  try {
    // Verifica se l'utente ha una recensione
    const recensione = await dao.getRecensioneByUserId(req.user.id);
    if (!recensione) {
      return res.redirect('/utenteDashboard?alert=errore&errorType=recensione_non_trovata');
    }

    // Eliminazione della recensione
    await dao.deleteRecensione(recensione.id);
    
    res.redirect('/utenteDashboard?alert=successo&successType=recensione_eliminata');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    res.redirect('/utenteDashboard?alert=errore&errorType=recensione_errore');
  }
});

module.exports = router;
