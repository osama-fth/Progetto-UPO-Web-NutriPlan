'use strict'
const express = require('express');
const router = express.Router();
const recensioniDAO = require('../models/daos/recensioniDAO');
const contattiDAO = require('../models/daos/contattiDAO');
const { check, validationResult } = require('express-validator');

// Home page
router.get('/', async (req, res) => {
  const success = req.session.success;
  const error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  
  res.render('pages/home', {
    title: 'NutriPlan - Home',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
    success: success,
    error: error
  });
});

// Pagina recensioni pubblica
router.get('/recensioni', async (req, res) => {
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

// Ricerca recensioni
router.get('/recensioni/search', async (req, res) => {
  const query = req.query.q || '';
  const success = req.session.success;
  const error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  
  try {
    let recensioni = [];
    
    if (query.trim() !== '') {
      recensioni = await recensioniDAO.searchRecensioni(query);
    } else {
      recensioni = await recensioniDAO.getAllRecensioni();
    }
    
    res.render('pages/recensioni', {
      title: 'NutriPlan - Ricerca Recensioni',
      recensioni,
      query,
      user: req.user || null,
      isAuth: req.isAuthenticated(),
      success: success,
      error: error
    });
  } catch (error) {
    console.error('Errore durante la ricerca delle recensioni:', error);
    req.session.error = "Errore durante la ricerca delle recensioni";
    res.redirect("/recensioni");
  }
});

// Invio messaggio di contatto
router.post('/contatti/invia', [
  check('nome').notEmpty().withMessage('Il nome è obbligatorio'),
  check('email').notEmpty().withMessage('L\'email è obbligatoria').isEmail().withMessage('Inserire un indirizzo email valido'),
  check('messaggio').notEmpty().withMessage('Il messaggio è obbligatorio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = 'Si prega di completare tutti i campi correttamente.';
      return res.redirect('/#contatti');
    }
    
    const { nome, email, messaggio } = req.body;
    await contattiDAO.inserisciRichiestaContatto(nome, email, messaggio);
    
    req.session.success = 'Il tuo messaggio è stato inviato correttamente.';
    res.redirect('/#contatti');
  } catch (error) {
    console.error('Errore durante l\'invio del messaggio di contatto:', error);
    req.session.error = 'Si è verificato un errore durante l\'invio del messaggio.';
    res.redirect('/#contatti');
  }
});

// Pagina di errore
router.get('/error', (req, res) => {
  let error = req.session.error;
  delete req.session.error;

  if (!error) {
    error = 'Si è verificato un errore imprevisto.';
  }
  
  res.render('pages/error', { 
    title: 'NutriPlan - Errore',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
    error: error  
  });
});

module.exports = router;
