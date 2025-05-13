'use strict'
const express = require("express")
const router = express.Router()
const passport = require("../models/passport")

// GET pagina login
router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.ruolo === 'admin') {
            return res.redirect('/adminDashboard');
        } else {
            return res.redirect('/utenteDashboard');
        }
    }
    
    res.render("pages/login", { 
        title: 'NutriPlan - Login',
        query: req.query 
    });
});

// POST login
router.post('/', (req, res, next) => {
    passport.authenticate("local", (err, utente, info) => {        
        if (err) {
            return next(err);
        }
        if (!utente) {
            let errorType = '';
            if (info && info.message) {
                if (info.message == 'Utente non trovato.') {
                    errorType = 'non_trovato';
                } else if (info.message == 'Password errata.') {
                    errorType = 'password_errata';
                }
            }
            return res.redirect(`/login?alert=errore&errorType=${errorType}`);
        }
        req.login(utente, (err) => {
            if (err) {
                return next(err);
            }
            
            // Reindirizza in base al ruolo
            if (utente.ruolo === 'admin') {
                return res.redirect('/adminDashboard');
            } else {
                return res.redirect('/utenteDashboard');
            }
        });
    })(req, res, next);
});

module.exports = router
