'use strict'
const express = require("express")
const router = express.Router()
const dayjs = require("dayjs");
const utentiDAO = require("../models/daos/utentiDAO");
const recensioniDAO = require("../models/daos/recensioniDAO");
const contattiDAO = require("../models/daos/contattiDAO");
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const pianiAlimentariDAO = require("../models/daos/pianiAlimentariDAO");
const middleware = require("../middleware/permessi");

// Middleware per tutte le rotte dell'admin
router.use(middleware.isAdmin);

// Dashboard principale dell'admin
router.get('/dashboard', async (req, res) => {
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

// Eliminazione utente
router.post('/utenti/elimina', async (req, res) => {
  try {
    const { utenteId } = req.body;
    
    // Elimina l'utente dal database
    await utentiDAO.deleteAccount(utenteId);
    
    req.session.success = 'Utente eliminato con successo';
    res.redirect('/admin/dashboard#pazienti');
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'utente:", error);
    req.session.error = 'Impossibile eliminare l\'utente';
    res.redirect('/admin/dashboard#pazienti');
  }
});

// Route per ottenere le misurazioni di un paziente
router.get('/pazienti/:id/misurazioni', async (req, res) => {
  try {
    const pazienteId = req.params.id;
    const misurazioni = await misurazioniDAO.getMisurazioniByUserId(pazienteId);
    
    // Formattazione per il front-end
    const misurazioniFormattate = misurazioni.map(m => ({
      id: m.id,
      misura: m.misura,
      dataFormattata: dayjs(m.data).format('DD/MM/YYYY'),
      data: m.data
    }));
    
    res.json(misurazioniFormattate);
  } catch (error) {
    console.error('Errore nel recupero delle misurazioni:', error);
    res.status(500).json({ error: 'Errore nel recupero delle misurazioni' });
  }
});

// Elimina recensione dall'admin dashboard
router.post('/recensioni/elimina', async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await recensioniDAO.deleteRecensione(recensioneId);
    
    req.session.success = 'Recensione eliminata con successo.';
    res.redirect('/admin/dashboard#recensioni');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.session.error = 'Errore durante l\'eliminazione della recensione.';
    res.redirect('/admin/dashboard#recensioni');
  }
});

// Elimina richiesta di contatto
router.post('/contatti/elimina', async (req, res) => {
  try {
    const { richiestaId } = req.body;
    
    await contattiDAO.deleteRichiestaContatto(richiestaId);
    
    req.session.success = 'Richiesta di contatto eliminata con successo.';
    res.redirect('/admin/dashboard#richieste-contatto');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della richiesta di contatto:', error);
    req.session.error = 'Errore durante l\'eliminazione della richiesta di contatto.';
    res.redirect('/admin/dashboard#richieste-contatto');
  }
});

// Route per ottenere i piani alimentari di un paziente
router.get('/pazienti/:id/piani-alimentari', async (req, res) => {
  try {
    const pazienteId = req.params.id;
    const piani = await pianiAlimentariDAO.getPianiAlimentariByUserId(pazienteId);
    
    // Formattazione per il front-end
    const pianiFormattati = piani.map(piano => ({
      id: piano.id,
      titolo: piano.titolo,
      descrizione: piano.descrizione,
      dataFormattata: dayjs(piano.data_creazione).format('DD/MM/YYYY'),
      data: piano.data_creazione
    }));
    
    res.json(pianiFormattati);
  } catch (error) {
    console.error('Errore nel recupero dei piani alimentari:', error);
    res.status(500).json({ error: 'Errore nel recupero dei piani alimentari' });
  }
});

// Route per ottenere un piano alimentare specifico
router.get('/piani-alimentari/:id', async (req, res) => {
  try {
    const pianoId = req.params.id;
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    if (!piano) {
      return res.status(404).json({ error: 'Piano alimentare non trovato' });
    }
    
    res.json(piano);
  } catch (error) {
    console.error('Errore nel recupero del piano alimentare:', error);
    res.status(500).json({ error: 'Errore nel recupero del piano alimentare' });
  }
});

// Route per creare un nuovo piano alimentare
router.post('/piani-alimentari/nuovo', async (req, res) => {
  try {
    const { utenteId, titolo, descrizione, data, contenuto } = req.body;
    
    if (!utenteId || !titolo || !data || !contenuto) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }
    
    const pianoId = await pianiAlimentariDAO.insertPianoAlimentare(
      utenteId, 
      titolo, 
      descrizione || '', 
      contenuto,
      data
    );
    
    res.json({ success: true, pianoId });
  } catch (error) {
    console.error('Errore nella creazione del piano alimentare:', error);
    res.status(500).json({ error: 'Errore nella creazione del piano alimentare' });
  }
});

// Route per eliminare un piano alimentare
router.post('/piani-alimentari/elimina', async (req, res) => {
  try {
    const { pianoId } = req.body;
    
    if (!pianoId) {
      req.session.error = 'ID piano mancante';
      return res.redirect('/admin/dashboard#pazienti');
    }
    
    await pianiAlimentariDAO.deletePianoAlimentare(pianoId);
    req.session.success = 'Piano alimentare eliminato con successo';
    res.redirect('/admin/dashboard#pazienti');
  } catch (error) {
    console.error('Errore nell\'eliminazione del piano alimentare:', error);
    req.session.error = 'Impossibile eliminare il piano alimentare';
    res.redirect('/admin/dashboard#pazienti');
  }
});

module.exports = router
