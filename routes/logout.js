'use strict'
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
            req.session.error = 'Si è verificato un errore durante il logout.';
            return res.redirect('/login');
        }
        req.session.success = 'Logout effettuato con successo.';
        res.redirect('/login');
    });
})

module.exports = router;
