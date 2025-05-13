'use strict'
const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  
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
