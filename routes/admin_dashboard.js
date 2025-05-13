'use strict'
const express = require("express")
const router = express.Router()
const dao = require("../models/dao");
const authMiddleware = require("../middleware/auth");


router.use(authMiddleware.isAdmin);

router.get('/', async (req, res) => {
    try {
        // Recupero tutti i pazienti
        const pazienti = await dao.getAllPazienti();
        const pazientiFormattati = pazienti.map(paziente => {
            const data = new Date(paziente.data_di_nascita);
            paziente.data_formattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            return paziente;
        });
        
        // Recupero tutte le recensioni con nomi dei pazienti
        const recensioni = await dao.getAllRecensioniWithUserInfo();
        const recensioniFormattate = recensioni.map(recensione => {
            const data = new Date(recensione.data_creazione); // Modifica da data_inserimento a data_creazione
            recensione.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            return recensione;
        });
        
        // Recupero tutte le richieste di contatto
        const richieste = await dao.getAllRichiesteContatto();
        const richiesteFormattate = richieste.map(richiesta => {
            const data = new Date(richiesta.data_creazione); // Modifica da data_inserimento a data_creazione
            richiesta.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            return richiesta;
        });

        // Recupera messaggi dalla sessione e poi cancellali
        const success = req.session.success;
        const error = req.session.error;
        delete req.session.success;
        delete req.session.error;

        res.render("pages/admin_dashboard", { 
            title: 'Dashboard Admin - NutriPlan',
            user: req.user, 
            pazienti: pazientiFormattati,
            recensioni: recensioniFormattate,
            richieste: richiesteFormattate,
            isAuth: req.isAuthenticated(),
            success: success,
            error: error
        });
    } catch (error) {
        console.error("Errore nel recupero dei dati:", error);
        req.session.error = "Errore durante il recupero dei dati";
        res.redirect("/error");
    }
});

module.exports = router
