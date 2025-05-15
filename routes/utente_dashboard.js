'use strict'
const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const recensioniDAO = require("../models/daos/recensioniDAO");
const pianiAlimentariDAO = require("../models/daos/pianiAlimentariDAO");
const authMiddleware = require("../middleware/auth");

// Applicazione del middleware per accesso solo a pazienti
router.use(authMiddleware.isPaziente);

router.get('/', async (req, res) => {
    // Imposto i valori predefiniti
    let misurazioniFormattate = [];
    let recensione = null;
    let pianiAlimentariFormattati = [];
    
    try {
        // Formatta la data di nascita dell'utente
        const userWithFormattedDate = {...req.user};
        userWithFormattedDate.dataFormattata = dayjs(req.user.data_di_nascita).format('DD/MM/YYYY');
        
        // Recupera le misurazioni dell'utente
        const misurazioni = await misurazioniDAO.getMisurazioniByUserId(req.user.id);
        
        // Formatta le date per la visualizzazione
        misurazioniFormattate = misurazioni.map(m => {
            m.dataFormattata = dayjs(m.data).format('DD/MM/YYYY');
            m.data_iso = dayjs(m.data).format('YYYY-MM-DD');
            return m;
        });
        
        // Recupera la recensione dell'utente
        try {
            recensione = await recensioniDAO.getRecensioneByUserId(req.user.id);
            if (recensione) {
                recensione.dataFormattata = dayjs(recensione.data_creazione).format('DD/MM/YYYY');
            }
        } catch (recErr) {
            console.error("Errore nel recupero delle recensioni:", recErr);
            // Continua con recensione = null
        }

        // Recupera i piani alimentari dell'utente
        try {
            const risultatoPiani = await pianiAlimentariDAO.getPianiAlimentariByUserId(req.user.id);
            
            if (risultatoPiani) {
                // Assicura che pianiAlimentari sia sempre un array
                const pianiArray = Array.isArray(risultatoPiani) ? risultatoPiani : [risultatoPiani];
                
                // Formatta le date per la visualizzazione
                pianiAlimentariFormattati = pianiArray.map(p => {
                    p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
                    if (p.data) {
                        p.data_iso = dayjs(p.data).format('YYYY-MM-DD');
                    }
                    return p;
                });
            }
        } catch (pianiErr) {
            console.error("Errore nel recupero dei piani alimentari:", pianiErr);
            // Continua con pianiAlimentariFormattati = []
        }

        // Recupera messaggi dalla sessione e poi cancellali
        const success = req.session.success;
        const error = req.session.error;
        delete req.session.success;
        delete req.session.error;

        // Renderizza la pagina con tutti i dati raccolti
        res.render('pages/utente_dashboard', {
            title: 'NutriPlan - Dashboard',
            user: userWithFormattedDate,
            isAuth: req.isAuthenticated(),
            misurazioni: misurazioniFormattate,
            recensione: recensione,
            pianiAlimentari: pianiAlimentariFormattati,
            success: success,
            error: error
        });
    } catch (err) {
        console.error("Errore nel recupero dei dati:", err);
        req.session.error = "Errore durante il recupero dei dati";
        res.redirect("/error");
    }
});

// POST nuova misurazione
router.post('/nuovaMisurazione', async (req, res) => {
    try {
        const { peso, data } = req.body;
        
        if (!peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
            req.session.error = 'I dati inseriti non sono validi.';
            return res.redirect('/utenteDashboard#misurazioni');
        }
        
        await misurazioniDAO.insertMisurazione(req.user.id, parseFloat(peso), data);
        
        req.session.success = 'Misurazione aggiunta con successo.';
        res.redirect('/utenteDashboard#misurazioni');
    } catch (err) {
        console.error("Errore nell'inserimento della misurazione:", err);
        req.session.error = 'Impossibile modificare la misurazione.';
        res.redirect('/utenteDashboard#misurazioni');
    }
});

module.exports = router;
