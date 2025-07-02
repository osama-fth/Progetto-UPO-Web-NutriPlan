'use strict';

const express = require('express');
const router = express.Router();
const recensioniDAO = require('../models/dao/recensioni-dao');
const contattiDAO = require('../models/dao/contatti-dao');
const { check, validationResult } = require('express-validator');

// Visualizza la pagina home del sito
router.get('/', async (req, res) => {
  res.render('pages/home', {
    title: 'NutriPlan - Home',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
  });
});

// Visualizza tutte le recensioni pubbliche
router.get('/recensioni', async (req, res) => {
  try {
    const recensioni = await recensioniDAO.getAllRecensioni();

    res.render('pages/recensioni', {
      title: 'NutriPlan - Recensioni',
      recensioni,
      user: req.user || null,
      isAuth: req.isAuthenticated(),
    });
  } catch (error) {
    console.error('Errore durante il recupero delle recensioni:', error);
    req.flash('error', 'Errore durante il recupero delle recensioni');
    res.redirect('/error');
  }
});

// Ricerca recensioni per query specifica
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
      title: 'NutriPlan - Recensioni',
      recensioni,
      query,
      user: req.user || null,
      isAuth: req.isAuthenticated(),
    });
  } catch (error) {
    console.error('Errore durante la ricerca delle recensioni:', error);
    req.flash('error', 'Errore durante la ricerca delle recensioni');
    res.redirect('/recensioni');
  }
});

// Gestisce l'invio di messaggi di contatto con validazione
router.post(
  '/contatti/invia',
  [
    check('nome')
      .notEmpty()
      .withMessage('Il nome è obbligatorio')
      .isLength({ min: 3 })
      .withMessage('Il nome deve contenere almeno 3 caratteri')
      .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ]+(['\s-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/)
      .withMessage('Il nome deve contenere solo lettere, spazi e apostrofi'),

    check('email')
      .notEmpty()
      .withMessage("L'email è obbligatoria")
      .isEmail()
      .withMessage('Inserisci un indirizzo email valido'),

    check('messaggio')
      .notEmpty()
      .withMessage('Il messaggio è obbligatorio')
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error('Il messaggio non può essere composto solo da spazi');
        }
        return true;
      })
      .isLength({ max: 500 })
      .withMessage('Il messaggio non può superare i 500 caratteri'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash('error', errors.array());
        return res.redirect('/#contatti');
      }

      const { nome, email, messaggio } = req.body;
      await contattiDAO.inserisciRichiestaContatto(nome, email, messaggio);

      req.flash('success', 'Il tuo messaggio è stato inviato correttamente.');
      res.redirect('/#contatti');
    } catch (error) {
      console.error("Errore durante l'invio del messaggio di contatto:", error);
      req.flash('error', "Si è verificato un errore durante l'invio del messaggio.");
      res.redirect('/#contatti');
    }
  },
);

// Visualizza la pagina privacy policy
router.get('/privacy', (req, res) => {
  res.render('pages/privacy', {
    title: 'NutriPlan - Privacy Policy',
    user: req.user,
    isAuth: req.isAuthenticated(),
  });
});

// Visualizza pagina di errore generica
router.get('/error', (req, res) => {
  res.render('pages/error', {
    title: 'NutriPlan - Errore',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
    errorMessage: res.locals.error || 'Si è verificato un errore imprevisto.',
  });
});

module.exports = router;
