'use strict'
const express = require("express")
const router = express.Router()

router.get('/', async (req, res) => {
  // Passa eventuali parametri di query alla vista
  res.render('pages/home', {
    title: 'NutriPlan - Home',
    user: req.user || null,
    isAuth: req.isAuthenticated(),
    alert: req.query.alert || null,
    errorType: req.query.errorType || null,
    messaggioInviato: req.query.messaggioInviato === 'true'
  });
});

module.exports = router
