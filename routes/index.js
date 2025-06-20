'use strict';

const express = require('express');
const router = express.Router();
const recensioniDAO = require('../models/dao/recensioni-dao');
const contattiDAO = require('../models/dao/contatti-dao');
const { check, validationResult } = require('express-validator');

// Home page
router.get('/', async (req, res) => {
  res.render('pages/home', {
    title: 'NutriPlan - Home',
    user: req.user || null,
    isAuth: req.isAuthenticated()
  });
});

// Pagina recensioni
router.get('/recensioni', async (req, res) => {
  try {
    const recensioni = await recensioniDAO.getAllRecensioni();
    
    res.render('pages/recensioni', {
      title: 'NutriPlan - Recensioni',
      recensioni,
      user: req.user || null,
      isAuth: req.isAuthenticated()  
    });
  } catch (error) {
    console.error('Errore durante il recupero delle recensioni:', error);
    req.flash('error', "Errore durante il recupero delle recensioni");
    res.redirect("/error");
  }
});

// Ricerca recensioni
router.get('/recensioni/search', async (req, res) => {
  const query = req.query.q || '';
  
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
      isAuth: req.isAuthenticated()
    });
  } catch (error) {
    console.error('Errore durante la ricerca delle recensioni:', error);
    req.flash('error', "Errore durante la ricerca delle recensioni");
    res.redirect("/recensioni");
  }
});

// Invio messaggio di contatto
router.post('/contatti/invia', [
  check('nome').notEmpty(),
  check('email').notEmpty().isEmail(),
  check('messaggio').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', 'Completare tutti i campi correttamente.');
      return res.redirect('/#contatti');
    }
    
    const { nome, email, messaggio } = req.body;
    await contattiDAO.inserisciRichiestaContatto(nome, email, messaggio);
    
    req.flash('success', 'Il tuo messaggio è stato inviato correttamente.');
    res.redirect('/#contatti');
  } catch (error) {
    console.error('Errore durante l\'invio del messaggio di contatto:', error);
    req.flash('error', 'Si è verificato un errore durante l\'invio del messaggio.');
    res.redirect('/#contatti');
  }
});

// Pagina privacy
router.get('/privacy', (req, res) => {
  res.render('pages/privacy', { 
    title: 'NutriPlan - Privacy Policy',
    user: req.user,
    isAuth: req.isAuthenticated()
  });
});

// Pagina di errore
router.get('/error', (req, res) => {
  let errorMsg = res.locals.error || 'Si è verificato un errore imprevisto.';
  
  res.render('pages/error', { 
    title: 'NutriPlan - Errore',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
    error: errorMsg
  });
});

module.exports = router;
