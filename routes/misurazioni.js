'use strict'

const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const authMiddleware = require("../middleware/auth");

// Applica il middleware di autenticazione a tutte le rotte
router.use(authMiddleware.isAuthenticated);

// Modifica una misurazione
router.post('/modifica', authMiddleware.isPaziente, async (req, res) => {
    try {
        const { misurazioneId, peso, data } = req.body;
        
        if (!parseFloat(peso) || !data) {
            req.session.error = 'I dati inseriti non sono validi.';
            return res.redirect('/utenteDashboard#misurazioni');
        }
                
        await misurazioniDAO.updateMisurazione(misurazioneId, parseFloat(peso), data);
        
        req.session.success = 'Misurazione aggiornata con successo.';
        res.redirect('/utenteDashboard#misurazioni');
    } catch (err) {
        console.error("Errore durante la modifica della misurazione:", err);
        req.session.error = 'Si è verificato un errore durante la modifica della misurazione.';
        res.redirect('/utenteDashboard#misurazioni');
    }
});

// Cancella una misurazione
router.get('/cancella/:id', authMiddleware.isPaziente, async (req, res) => {
    try {
        const misurazioneId = req.params.id;
        
        await misurazioniDAO.deleteMisurazione(misurazioneId);
        
        req.session.success = 'Misurazione eliminata con successo.';
        res.redirect('/utenteDashboard#misurazioni');
    } catch (err) {
        console.error("Errore durante l'eliminazione della misurazione:", err);
        req.session.error = 'Si è verificato un errore durante l\'eliminazione della misurazione.';
        res.redirect('/utenteDashboard#misurazioni');
    }
});

// Recupera le misurazioni di un paziente specifico (solo per admin)
router.get('/paziente/:id', authMiddleware.isAdmin, async (req, res) => {
    try {
        const pazienteId = req.params.id;
        const misurazioni = await misurazioniDAO.getMisurazioniByUserId(pazienteId);
        
        // Formatta le date per JSON
        const misurazioniFormattate = misurazioni.map(m => {
            return {
                id: m.id,
                misura: m.misura,
                dataFormattata: dayjs(m.data).format('DD/MM/YYYY')
            };
        });
        
        res.json(misurazioniFormattate);
    } catch (err) {
        console.error("Errore nel recupero delle misurazioni:", err);
        res.status(500).json({ error: 'Errore durante il recupero delle misurazioni' });
    }
});

module.exports = router;
