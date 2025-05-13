'use strict'
const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/error', { 
    title: 'NutriPlan - Errore',
    user: req.user || null,
    isAuth: req.isAuthenticated()
  });
});

module.exports = router;
