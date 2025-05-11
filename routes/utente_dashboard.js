'use strict'
const express = require("express")
const router = express.Router()
const dao = require("../models/dao")

router.get('/', async (req, res) => {
    if(!req.isAuthenticated()) {
        return res.redirect('/login?alert=errore&errorType=non_autorizzato');
    }
    
    try {
        // Recupera le misurazioni dell'utente
        const misurazioni = await dao.getMisurazioniByUserId(req.user.id);
        
        // Formatta le date per la visualizzazione
        const misurazioniFormattate = misurazioni.map(m => {
            const data = new Date(m.data);
            m.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            // Aggiungi formato ISO per il campo data nel form
            m.data_iso = m.data.split('T')[0]; // formato YYYY-MM-DD
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

router.post('/nuovaMisurazione', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send("Non autorizzato");
    }
    
    try {
        const { peso, data } = req.body;
        
        // Validazione dei dati
        if (!peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
            return res.status(400).send("Dati non validi");
        }
        
        // Inserimento della misurazione
        await dao.insertMisurazione(req.user.id, parseFloat(peso), data);
        
        // Reindirizza alla dashboard
        res.redirect('/utenteDashboard');
    } catch (err) {
        console.error("Errore nell'inserimento della misurazione:", err);
        res.status(500).send("Errore nell'inserimento della misurazione");
    }
});

module.exports = router
