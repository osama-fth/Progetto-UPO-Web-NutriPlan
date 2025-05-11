'use strict'
const express = require("express")
const router = express.Router()
const dao = require("../models/dao");

router.get('/', async (req, res) => {
    if(!req.isAuthenticated()) {
        return res.redirect('/login?alert=errore&errorType=non_autorizzato');
    }

    try {
        const pazienti = await dao.getAllPazienti();
        
        // Formatta le date di nascita per la visualizzazione
        const pazientiFormattati = pazienti.map(paziente => {
            const data = new Date(paziente.data_di_nascita);
            // Formatta la data come DD/MM/YYYY
            paziente.data_formattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            return paziente;
        });

        res.render("pages/admin_dashboard", { 
            user: req.user, 
            pazienti: pazientiFormattati,
            isAuth: req.isAuthenticated()
        });
    } catch (error) {
        console.error("Errore nel recupero dei pazienti:", error);
        res.render("pages/admin_dashboard", { 
            user: req.user, 
            pazienti: [],
            error: "Errore nel recupero dei pazienti"
        });
    }
});

module.exports = router
