'use strict'
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
            return next(err);
        }
        res.redirect('/login?alert=success&successType=logut-success')
    });
}
)

module.exports = router;
