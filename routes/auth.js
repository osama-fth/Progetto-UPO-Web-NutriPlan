'use strict'
const express = require("express")
const router = express.Router()
const passport = require("../models/passport")
const { check, validationResult } = require('express-validator')
const bcrypt = require("bcrypt")
const utentiDAO = require("../models/daos/utentiDAO")

// ==================== LOGIN ====================

// GET pagina login
router.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.ruolo === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/user/dashboard');
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
router.post('/login', [
    check('email').notEmpty().withMessage('Il campo email è obbligatorio').isEmail().withMessage('Inserisci un indirizzo email valido'),
    check('password').notEmpty().withMessage('Il campo password è obbligatorio')
], (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.error = errors.array()[0].msg;
        return res.redirect('/auth/login');
    }

    passport.authenticate("local", (err, utente, info) => {        
        if (err) {
            console.error('Errore durante l\'autenticazione:', err);
            req.session.error = 'Si è verificato un errore durante l\'accesso.';
            return res.redirect('/auth/login');
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
            return res.redirect('/auth/login');
        }
        
        req.login(utente, (err) => {
            if (err) {
                req.session.error = 'Errore durante il login.';
                return res.redirect('/auth/login');
            }
            
            if (utente.ruolo === 'admin') {
                return res.redirect('/admin/dashboard');
            } else {
                return res.redirect('/user/dashboard');
            }
        });
    })(req, res, next);
});

// ==================== LOGOUT ====================

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
            req.session.error = 'Si è verificato un errore durante il logout.';
            return res.redirect('/auth/login');
        }
        req.session.success = 'Logout effettuato con successo.';
        res.redirect('/auth/login');
    });
});

// ==================== REGISTER ====================

router.get("/register", (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.ruolo === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/user/dashboard');
        }
    }
    
    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;
    
    res.render("pages/register", { 
        title: 'NutriPlan - Registrazione',
        user: req.user,
        isAuth: req.isAuthenticated(),
        success: success,
        error: error
    });
});

router.post("/register", [
    check('nome').notEmpty().withMessage("Il nome è obbligatorio").matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il nome deve contenere solo lettere'),
    check('cognome').notEmpty().withMessage("Il cognome è obbligatorio").matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il cognome deve contenere solo lettere'),
    check('email').isEmail().withMessage('Inserisci un indirizzo email valido').notEmpty().withMessage('L\'email è obbligatoria'),
    check('password').isLength({ min: 8 }).withMessage('La password deve essere lunga almeno 8 caratteri'),
    check('data_di_nascita').isDate().withMessage('Inserisci una data di nascita valida'),
    check('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Le password non coincidono');
            }
            return true;
        }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("pages/register", { 
            title: 'NutriPlan - Registrazione',
            user: req.user,
            errors: errors.array(),
            formData: req.body 
        });
    }

    try {
        const cryptoPwd = await bcrypt.hash(req.body.password, 10);
        await utentiDAO.newUser(
            req.body, 
            cryptoPwd
        );
        req.session.success = 'Registrazione completata con successo.';
        return res.redirect("/auth/login");
    } catch (error) {
        console.log("Errore durante la registrazione: ", error);
        req.session.error = "Errore durante la registrazione. Email già in uso.";
        return res.redirect("/auth/register");
    }
});

module.exports = router;
