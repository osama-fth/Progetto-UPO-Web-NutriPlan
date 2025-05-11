'use strict'
const express = require("express")
const router = express.Router()
const dao = require("../models/dao");
const authMiddleware = require("../middleware/auth");

// Applico il middleware per verificare che l'utente sia un admin
router.use(authMiddleware.isAdmin);

router.get('/', async (req, res) => {
    try {
        const pazienti = await dao.getAllPazienti();
        
        // Formatta le date di nascita per la visualizzazione
        const pazientiFormattati = pazienti.map(paziente => {
            const data = new Date(paziente.data_di_nascita);
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
