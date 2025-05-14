'use strict'
const express = require("express")
const router = express.Router()

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

module.exports = router
