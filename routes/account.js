const express = require('express');
const router = express.Router();
const utentiDAO = require('../models/daos/utentiDAO');
const authMiddleware = require("../middleware/auth");

// Richiesta di eliminazione account
router.get('/elimina', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        
        const utenteId = req.user.id;
        await utentiDAO.deleteAccount(utenteId);
        
        req.logout(function(err) {
            if (err) { 
                console.error("Errore durante il logout:", err);
            }
            
            // Messaggio nella sessione temporanea
            req.session.success = 'Account eliminato con successo.';
            res.redirect('/');
        });
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'account:", error);
        req.session.error = 'Impossibile eliminare l\'elemento selezionato.';
        res.redirect('/utenteDashboard');
    }
});

module.exports = router;
