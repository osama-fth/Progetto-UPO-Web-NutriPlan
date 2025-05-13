const express = require('express');
const router = express.Router();
const dao = require('../models/dao');

// Modifica misurazione
router.post('/modifica', async (req, res) => {
    try {
        const { misurazioneId, peso, data } = req.body;
        
        if (!misurazioneId || !peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
            req.session.error = 'I dati inseriti non sono validi.';
            return res.redirect('/utenteDashboard');
        }
            
        await dao.updateMisurazione(misurazioneId, parseFloat(peso), data);
        
        req.session.success = 'Misurazione modificata con successo.';
        res.redirect('/utenteDashboard');
    } catch (error) {
        console.error('Errore durante la modifica della misurazione:', error);
        req.session.error = 'Impossibile modificare la misurazione.';
        res.redirect('/utenteDashboard');
    }
});

// Elimina una misurazione
router.get('/cancella/:id', async (req, res) => {
    try {
        const misurazioneId = req.params.id;
        await dao.deleteMisurazione(misurazioneId);
        
        req.session.success = 'Misurazione eliminata con successo.';
        res.redirect('/utenteDashboard');
    } catch (error) {
        console.error('Errore durante l\'eliminazione della misurazione:', error);
        req.session.error = 'Impossibile eliminare l\'elemento selezionato.';
        res.redirect('/utenteDashboard');
    }
});

module.exports = router;
