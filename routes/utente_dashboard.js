'use strict'
const express = require("express");
const router = express.Router();
const dao = require("../models/dao");
const authMiddleware = require("../middleware/auth");

// Applicazione del middleware per accesso solo a pazienti
router.use(authMiddleware.isPaziente);

router.get('/', async (req, res) => {
    try {
        // Recupera le misurazioni dell'utente
        const misurazioni = await dao.getMisurazioniByUserId(req.user.id);
        
        // Formatta le date per la visualizzazione
        const misurazioniFormattate = misurazioni.map(m => {
            const data = new Date(m.data);
            m.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            m.data_iso = m.data.split('T')[0];
            return m;
        });
        
        let recensione = null;
        try {
            recensione = await dao.getRecensioneByUserId(req.user.id);
            if (recensione) {
                const data = new Date(recensione.data_creazione);
                recensione.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            }
        } catch (recErr) {
            console.error("Errore nel recupero della recensione:", recErr);
        }
        
        res.render('pages/utente_dashboard', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            misurazioni: misurazioniFormattate,
            recensione: recensione
        });
    } catch (err) {
        console.error("Errore nel recupero delle misurazioni:", err);
        res.render('pages/utente_dashboard', {
            user: req.user,
            isAuth: req.isAuthenticated(),
            misurazioni: [],
            error: "Errore nel recupero delle misurazioni"
        });
    }
});

// POST nuova misurazione
router.post('/nuovaMisurazione', async (req, res) => {
    try {
        const { peso, data } = req.body;
        
        if (!peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
            return res.status(400).send("Dati non validi");
        }
        
        await dao.insertMisurazione(req.user.id, parseFloat(peso), data);
        
        res.redirect('/utenteDashboard');
    } catch (err) {
        console.error("Errore nell'inserimento della misurazione:", err);
        res.status(500).send("Errore nell'inserimento della misurazione");
    }
});

module.exports = router;
