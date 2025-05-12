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
      return res.status(400).redirect('/utenteDashboard?alert=errore&errorType=recensione_vuota');
    }

    await dao.insertRecensione(req.user.id, commento.trim());
    
    res.redirect('/utenteDashboard?alert=successo&successType=recensione_aggiunta');
  } catch (error) {
    console.error('Errore durante l\'aggiunta della recensione:', error);
    res.redirect('/utenteDashboard?alert=errore&errorType=recensione_errore');
  }
});

// POST modifica recensione {-----DA ELEIMINARE------}
// router.post('/modifica', authMiddleware.isAuthenticated, async (req, res) => {
//   try {
//     const { recensioneId, commento } = req.body;
    
//     // Validazione
//     if (!commento || commento.trim() === '') {
//       return res.status(400).redirect('/utenteDashboard?alert=errore&errorType=recensione_vuota');
//     }

//     // Aggiornamento della recensione
//     await dao.updateRecensione(recensioneId, commento.trim());
    
//     res.redirect('/utenteDashboard?alert=successo&successType=recensione_modificata');
//   } catch (error) {
//     console.error('Errore durante la modifica della recensione:', error);
//     res.redirect('/utenteDashboard?alert=errore&errorType=recensione_errore');
//   }
// });

// Cancella recensione
router.post('/cancella', authMiddleware.isAuthenticated, async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await dao.deleteRecensione(recensioneId);
    
    res.redirect('/utenteDashboard?alert=successo&successType=recensione_eliminata');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    res.redirect('/utenteDashboard?alert=errore&errorType=recensione_errore');
  }
});

module.exports = router;
