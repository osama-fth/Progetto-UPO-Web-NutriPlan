const express = require('express');
const router = express.Router();
const dao = require('../models/dao');

/**
 * Gestisce la richiesta di eliminazione dell'account
 */
router.get('/elimina', async (req, res) => {
    // Verifica che l'utente sia autenticato
    if (!req.isAuthenticated()) {
        return res.status(401).redirect('/login?alert=errore&errorType=non_autorizzato');
    }

    try {
        // Ottieni l'ID dell'utente dalla sessione
        const utenteId = req.user.id;
        
        // Elimina l'account (le relazioni verranno eliminate automaticamente grazie a ON DELETE CASCADE)
        await dao.deleteAccount(utenteId);
        
        // Esegui il logout
        req.logout(function(err) {
            if (err) { 
                console.error("Errore durante il logout:", err);
            }
            
            // Elimina la sessione
            req.session.destroy(function (err) {
                if (err) {
                    console.error("Errore nell'eliminazione della sessione:", err);
                }
                
                // Reindirizza alla homepage con messaggio di conferma
                res.redirect('/?alert=successo&successType=account_eliminato');
            });
        });
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'account:", error);
        res.redirect('/utenteDashboard?alert=errore&errorType=eliminazione_fallita');
    }
});

module.exports = router;
