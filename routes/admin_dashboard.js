'use strict'
const express = require("express")
const router = express.Router()
const dayjs = require("dayjs");
const utentiDAO = require("../models/daos/utentiDAO");
const recensioniDAO = require("../models/daos/recensioniDAO");
const contattiDAO = require("../models/daos/contattiDAO");
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const authMiddleware = require("../middleware/auth");


router.use(authMiddleware.isAdmin);

router.get('/', async (req, res) => {
    try {
        // Recupero tutti i pazienti
        const pazienti = await utentiDAO.getAllPazienti();
        const pazientiFormattati = pazienti.map(paziente => {
            paziente.data_formattata = dayjs(paziente.data_di_nascita).format('DD/MM/YYYY');
            return paziente;
        });
        
        // Recupero tutte le recensioni con nomi dei pazienti
        const recensioni = await recensioniDAO.getAllRecensioniWithUserInfo();
        const recensioniFormattate = recensioni.map(recensione => {
            recensione.dataFormattata = dayjs(recensione.data_creazione).format('DD/MM/YYYY');
            return recensione;
        });
        
        // Recupero tutte le richieste di contatto
        const richieste = await contattiDAO.getAllRichiesteContatto();
        const richiesteFormattate = richieste.map(richiesta => {
            richiesta.dataFormattata = dayjs(richiesta.data_creazione).format('DD/MM/YYYY');
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

// Route per eliminare un utente
router.post('/elimina-utente', authMiddleware.isAdmin, async (req, res) => {
  try {
    const { utenteId } = req.body;
    
    // Elimina l'utente dal database
    await utentiDAO.deleteAccount(utenteId);
    
    req.session.success = 'Utente eliminato con successo';
    res.redirect('/adminDashboard#pazienti');
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'utente:", error);
    req.session.error = 'Impossibile eliminare l\'utente';
    res.redirect('/adminDashboard#pazienti');
  }
});

// Route per ottenere le misurazioni di un paziente
router.get('/paziente/:id/misurazioni', authMiddleware.isAdmin, async (req, res) => {
  try {
    const pazienteId = req.params.id;
    const misurazioni = await misurazioniDAO.getMisurazioniByUtente(pazienteId);
    
    // Formato richiesto per il frontend
    const misurazioniFormattate = misurazioni.map(m => ({
      id: m.id,
      misura: m.misura,
      dataFormattata: dayjs(m.data).format('DD/MM/YYYY')
    }));
    
    res.json(misurazioniFormattate);
  } catch (error) {
    console.error('Errore nel recupero delle misurazioni:', error);
    res.status(500).json({ error: 'Errore nel recupero delle misurazioni' });
  }
});

module.exports = router
