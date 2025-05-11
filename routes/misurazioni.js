const express = require('express');
const router = express.Router();
const dao = require('../models/dao');

// Modifica misurazione
router.post('/modifica', async (req, res) => {
    try {
        const { misurazioneId, peso, data } = req.body;
        
        if (!misurazioneId || !peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
            return res.status(400).redirect('/utenteDashboard?alert=errore&errorType=dati_non_validi');
        }
            
        await dao.updateMisurazione(misurazioneId, parseFloat(peso), data);
        
        res.redirect('/utenteDashboard?alert=successo&successType=misurazione_modificata');
    } catch (error) {
        console.error('Errore durante la modifica della misurazione:', error);
        res.redirect('/utenteDashboard?alert=errore&errorType=modifica_fallita');
    }
});

// Elimina una misurazione
router.get('/cancella/:id', async (req, res) => {
    try {
        const misurazioneId = req.params.id;
        await dao.deleteMisurazione(misurazioneId);
        
        res.redirect('/utenteDashboard?alert=successo&successType=misurazione_eliminata');
    } catch (error) {
        console.error('Errore durante l\'eliminazione della misurazione:', error);
        res.redirect('/utenteDashboard?alert=errore&errorType=eliminazione_fallita');
    }
});

module.exports = router;
