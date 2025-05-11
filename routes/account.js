const express = require('express');
const router = express.Router();
const dao = require('../models/dao');
const authMiddleware = require("../middleware/auth");

// Richiesta di eliminazione account
router.get('/elimina', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        
        const utenteId = req.user.id;
        await dao.deleteAccount(utenteId);
        
        req.logout(function(err) {
            if (err) { 
                console.error("Errore durante il logout:", err);
            }

            res.redirect('/?alert=successo&successType=account_eliminato');
        });
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'account:", error);
        res.redirect('/utenteDashboard?alert=errore&errorType=eliminazione_fallita');
    }
});

module.exports = router;
