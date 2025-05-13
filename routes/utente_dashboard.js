'use strict'
const express = require("express");
const router = express.Router();
const dao = require("../models/dao");
const authMiddleware = require("../middleware/auth");

// Applicazione del middleware per accesso solo a pazienti
router.use(authMiddleware.isPaziente);

router.get('/', async (req, res) => {
    // Imposto i valori predefiniti
    let misurazioniFormattate = [];
    let recensione = null;
    let pianiAlimentariFormattati = [];
    
    try {
        // Recupera le misurazioni dell'utente
        const misurazioni = await dao.getMisurazioniByUserId(req.user.id);
        
        // Formatta le date per la visualizzazione
        misurazioniFormattate = misurazioni.map(m => {
            const data = new Date(m.data);
            m.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            m.data_iso = m.data.split('T')[0];
            return m;
        });
        
        // Recupera la recensione dell'utente
        try {
            recensione = await dao.getRecensioneByUserId(req.user.id);
            if (recensione) {
                const data = new Date(recensione.data_creazione);
                recensione.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
            }
        } catch (recErr) {
            console.error("Errore nel recupero delle recensioni:", recErr);
            // Continua con recensione = null
        }

        // Recupera i piani alimentari dell'utente
        try {
            const risultatoPiani = await dao.getPianiAlimentariByUserId(req.user.id);
            
            if (risultatoPiani) {
                // Assicura che pianiAlimentari sia sempre un array
                const pianiArray = Array.isArray(risultatoPiani) ? risultatoPiani : [risultatoPiani];
                
                // Formatta le date per la visualizzazione
                pianiAlimentariFormattati = pianiArray.map(p => {
                    const data = new Date(p.data_creazione);
                    p.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
                    if (p.data) {
                        p.data_iso = p.data.split('T')[0];
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
            user: req.user,
            isAuth: req.isAuthenticated(),
            misurazioni: misurazioniFormattate,
            recensione: recensione,
            pianiAlimentari: pianiAlimentariFormattati,
            success: success,
            error: error
        });
    } catch (err) {
        console.error("Errore nel recupero dei dati:", error);
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
            return res.redirect('/utenteDashboard');
        }
        
        await dao.insertMisurazione(req.user.id, parseFloat(peso), data);
        
        req.session.success = 'Misurazione aggiunta con successo.';
        res.redirect('/utenteDashboard');
    } catch (err) {
        console.error("Errore nell'inserimento della misurazione:", err);
        req.session.error = 'Impossibile modificare la misurazione.';
        res.redirect('/utenteDashboard');
    }
});

module.exports = router;
