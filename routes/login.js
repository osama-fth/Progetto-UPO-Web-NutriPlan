'use strict'
const express = require("express")
const router = express.Router()
const passport = require("../models/passport")
const { check, validationResult } = require('express-validator'); // Importa express-validator

// GET pagina login
router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.ruolo === 'admin') {
            return res.redirect('/adminDashboard');
        } else {
            return res.redirect('/utenteDashboard');
        }
    }
    
    // Recupera i messaggi dalla sessione
    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;
    
    res.render("pages/login", { 
        title: 'NutriPlan - Login',
        query: req.query,
        success: success,  
        error: error       
    });
});

// POST login con middleware di validazione
router.post('/', [
    check('email').notEmpty().withMessage('Il campo email è obbligatorio').isEmail().withMessage('Inserisci un indirizzo email valido'),
    check('password').notEmpty().withMessage('Il campo password è obbligatorio')
], (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.error = errors.array()[0].msg;
        return res.redirect('/login');
    }

    passport.authenticate("local", (err, utente, info) => {        
        if (err) {
            console.error('Errore durante l\'autenticazione:', err);
            req.session.error = 'Si è verificato un errore durante l\'accesso.';
            return res.redirect('/login');
        }
        
        if (!utente) {
            if (info && info.message) {
                if (info.message == 'Utente non trovato.') {
                    req.session.error = 'Nessun utente trovato con questa email.';
                } else if (info.message == 'Password errata.') {
                    req.session.error = 'Password non corretta. Riprova.';
                } else {
                    req.session.error = info.message;
                }
            } else {
                req.session.error = 'Si è verificato un errore durante l\'accesso.';
            }
            return res.redirect('/login');
        }
        
        req.login(utente, (err) => {
            if (err) {
                req.session.error = 'Errore durante il login.';
                return res.redirect('/login');
            }
            
            if (utente.ruolo === 'admin') {
                return res.redirect('/adminDashboard');
            } else {
                return res.redirect('/utenteDashboard');
            }
        });
    })(req, res, next);
});

module.exports = router
