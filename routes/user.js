'use strict'
const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const recensioniDAO = require("../models/daos/recensioniDAO");
const pianiAlimentariDAO = require("../models/daos/pianiAlimentariDAO");
const utentiDAO = require("../models/daos/utentiDAO");
const authMiddleware = require("../middleware/permessi");

router.use(authMiddleware.isAuthenticated);

// Dashboard principale dell'utente
router.get('/dashboard', authMiddleware.isPaziente, async (req, res) => {
    
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
router.post('/misurazioni/nuova', authMiddleware.isPaziente, async (req, res) => {
    try {
        const { peso, data } = req.body;
        
        if (!peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
            req.session.error = 'I dati inseriti non sono validi.';
            return res.redirect('/user/dashboard#misurazioni');
        }
        
        await misurazioniDAO.insertMisurazione(req.user.id, parseFloat(peso), data);
        
        req.session.success = 'Misurazione aggiunta con successo.';
        res.redirect('/user/dashboard#misurazioni');
    } catch (err) {
        console.error("Errore nell'inserimento della misurazione:", err);
        req.session.error = 'Impossibile modificare la misurazione.';
        res.redirect('/user/dashboard#misurazioni');
    }
});

// Modifica una misurazione
router.post('/misurazioni/modifica', authMiddleware.isPaziente, async (req, res) => {
    try {
        const { misurazioneId, peso, data } = req.body;
        
        if (!parseFloat(peso) || !data) {
            req.session.error = 'I dati inseriti non sono validi.';
            return res.redirect('/user/dashboard#misurazioni');
        }
                
        await misurazioniDAO.updateMisurazione(misurazioneId, parseFloat(peso), data);
        
        req.session.success = 'Misurazione aggiornata con successo.';
        res.redirect('/user/dashboard#misurazioni');
    } catch (err) {
        console.error("Errore durante la modifica della misurazione:", err);
        req.session.error = 'Si è verificato un errore durante la modifica della misurazione.';
        res.redirect('/user/dashboard#misurazioni');
    }
});

// Cancella una misurazione
router.get('/misurazioni/elimina/:id', authMiddleware.isPaziente, async (req, res) => {
    try {
        const misurazioneId = req.params.id;
        
        await misurazioniDAO.deleteMisurazione(misurazioneId);
        
        req.session.success = 'Misurazione eliminata con successo.';
        res.redirect('/user/dashboard#misurazioni');
    } catch (err) {
        console.error("Errore durante l'eliminazione della misurazione:", err);
        req.session.error = 'Si è verificato un errore durante l\'eliminazione della misurazione.';
        res.redirect('/user/dashboard#misurazioni');
    }
});

// Aggiungi recensione
router.post('/recensioni/nuova', authMiddleware.isPaziente, async (req, res) => {
  try {
    const { commento } = req.body;
    
    if (!commento || commento.trim() === '') {
      req.session.error = 'Il testo della recensione non può essere vuoto.';
      return res.redirect('/user/dashboard#recensioni');
    }

    await recensioniDAO.insertRecensione(req.user.id, commento.trim());
    
    req.session.success = 'Recensione pubblicata con successo.';
    res.redirect('/user/dashboard#recensioni');
  } catch (error) {
    console.error('Errore durante l\'aggiunta della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/user/dashboard#recensioni');
  }
});

// Cancella recensione
router.post('/recensioni/cancella', authMiddleware.isPaziente, async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await recensioniDAO.deleteRecensione(recensioneId);
    
    req.session.success = 'Recensione eliminata con successo.';
    res.redirect('/user/dashboard#recensioni');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.session.error = 'Errore durante la gestione della recensione.';
    res.redirect('/user/dashboard#recensioni');
  }
});

// Richiesta di eliminazione account
router.get('/account/elimina', authMiddleware.isPaziente, async (req, res) => {
    try {
        const utenteId = req.user.id;
        await utentiDAO.deleteAccount(utenteId);
        
        req.logout(function(err) {
            if (err) { 
                console.error("Errore durante il logout:", err);
            }
            
            // Messaggio nella sessione temporanea
            req.session.success = 'Account eliminato con successo.';
            res.redirect('/auth/login');
        });
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'account:", error);
        req.session.error = 'Impossibile eliminare l\'elemento selezionato.';
        res.redirect('/user/dashboard');
    }
});

module.exports = router;
