const express = require('express');
const router = express.Router();
const dao = require('../models/dao');

/**
 * Modifica una misurazione esistente
 */
router.post('/modifica', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).redirect('/login?alert=errore&errorType=non_autorizzato');
    }
    
    try {
        const { misurazioneId, peso, data } = req.body;
        
        // Validazione dati
        if (!misurazioneId || !peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
            return res.status(400).redirect('/utenteDashboard?alert=errore&errorType=dati_non_validi');
        }
        
        // Verifica che la misurazione appartenga all'utente
        const misurazione = await dao.getMisurazioneById(misurazioneId);
        if (!misurazione || misurazione.utente_id !== req.user.id) {
            return res.status(403).redirect('/utenteDashboard?alert=errore&errorType=non_autorizzato');
        }
        
        // Aggiorna misurazione
        await dao.updateMisurazione(misurazioneId, parseFloat(peso), data);
        
        res.redirect('/utenteDashboard?alert=successo&successType=misurazione_modificata');
    } catch (error) {
        console.error('Errore durante la modifica della misurazione:', error);
        res.redirect('/utenteDashboard?alert=errore&errorType=modifica_fallita');
    }
});

/**
 * Elimina una misurazione
 */
router.get('/cancella/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).redirect('/login?alert=errore&errorType=non_autorizzato');
    }
    
    try {
        const misurazioneId = req.params.id;
        
        // Verifica che la misurazione appartenga all'utente
        const misurazione = await dao.getMisurazioneById(misurazioneId);
        if (!misurazione || misurazione.utente_id !== req.user.id) {
            return res.status(403).redirect('/utenteDashboard?alert=errore&errorType=non_autorizzato');
        }
        
        // Elimina misurazione
        await dao.deleteMisurazione(misurazioneId);
        
        res.redirect('/utenteDashboard?alert=successo&successType=misurazione_eliminata');
    } catch (error) {
        console.error('Errore durante l\'eliminazione della misurazione:', error);
        res.redirect('/utenteDashboard?alert=errore&errorType=eliminazione_fallita');
    }
});

module.exports = router;
