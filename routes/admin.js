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

router.use(middleware.isAdmin);

// Rotta base che reindirizza alla vista pazienti
router.get('/dashboard', (req, res) => {
  res.redirect('/admin/dashboard/pazienti');
});

// Rotte specifiche per le diverse sezioni della dashboard
router.get('/dashboard/:section', async (req, res) => {
    const section = req.params.section;
    const validSections = ['pazienti', 'recensioni', 'richieste-contatto'];
    
    if (!validSections.includes(section)) {
        return res.redirect('/admin/dashboard/pazienti');
    }
    
    let pazientiFormattati = [];
    let recensioniFormattate = [];
    let richiesteFormattate = [];

    try {
        const pazienti = await utentiDAO.getAllPazienti();
        pazientiFormattati = pazienti.map(paziente => {
            paziente.data_formattata = dayjs(paziente.data_di_nascita).format('DD/MM/YYYY');
            return paziente;
        });
    } catch (error) {
        console.error("Errore nel recupero dei pazienti:", error);
        req.session.error = "Impossibile caricare la lista dei pazienti";
    }
    
    try {
        const recensioni = await recensioniDAO.getAllRecensioniWithUserInfo();
        recensioniFormattate = recensioni.map(recensione => {
            recensione.dataFormattata = dayjs(recensione.data_creazione).format('DD/MM/YYYY');
            return recensione;
        });
    } catch (error) {
        console.error("Errore nel recupero delle recensioni:", error);
        req.session.error = "Impossibile caricare le recensioni";
    }
    
    try {
        const richieste = await contattiDAO.getAllRichiesteContatto();
        richiesteFormattate = richieste.map(richiesta => {
            richiesta.dataFormattata = dayjs(richiesta.data_creazione).format('DD/MM/YYYY');
            return richiesta;
        });
    } catch (error) {
        console.error("Errore nel recupero delle richieste di contatto:", error);
        req.session.error = "Impossibile caricare le richieste di contatto"; 
    }

    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;

    try {
        res.render("pages/admin_dashboard", { 
            title: 'Dashboard Admin - NutriPlan',
            user: req.user, 
            pazienti: pazientiFormattati,
            recensioni: recensioniFormattate,
            richieste: richiesteFormattate,
            isAuth: req.isAuthenticated(),
            success: success,
            error: error,
            currentSection: section
        });
    } catch (err) {
        console.error("Errore nel rendering della pagina:", err);
        req.session.error = "Errore durante la visualizzazione della dashboard";
        res.redirect("/error");
    }
});

// Eliminazione utente
router.post('/utenti/elimina', async (req, res) => {
  try {
    const { utenteId } = req.body;
    
    await utentiDAO.deleteAccount(utenteId);
    
    req.session.success = 'Utente eliminato con successo';
    res.redirect('/admin/dashboard#pazienti');
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'utente:", error);
    req.session.error = 'Impossibile eliminare l\'utente';
    res.redirect('/admin/dashboard#pazienti');
  }
});

// GET misurazioni di un paziente
router.get('/pazienti/:id/misurazioni', async (req, res) => {
  try {
    const pazienteId = req.params.id;
    const misurazioni = await misurazioniDAO.getMisurazioniByUserId(pazienteId);
    
    const misurazioniFormattate = misurazioni.map(m => ({
      id: m.id,
      misura: m.misura,
      dataFormattata: dayjs(m.data).format('DD/MM/YYYY'),
      data: m.data
    }));
    
    res.json(misurazioniFormattate);
  } catch (error) {
    console.error('Errore nel recupero delle misurazioni:', error);
    req.session.error = 'Impossibile recuperare le misurazioni';
    res.redirect('/admin/dashboard#pazienti');
  }
});

// Elimina recensione
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

// GET piani alimentari di un paziente
router.get('/pazienti/:id/piani-alimentari', async (req, res) => {
  try {
    const pazienteId = req.params.id;
    const piani = await pianiAlimentariDAO.getPianiAlimentariByUserId(pazienteId);
    
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
    req.session.error = 'Impossibile recuperare i piani alimentari';
    res.redirect('/admin/dashboard#pazienti');
  }
});

// GET piano alimentare specifico dato id
router.get('/piani-alimentari/:id', async (req, res) => {
  try {
    const pianoId = req.params.id;
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    res.json(piano);
  } catch (error) {
    console.error('Errore nel recupero del piano alimentare:', error);
    req.session.error = 'Impossibile recuperare il piano alimentare';
    res.redirect('/admin/dashboard#pazienti');
  }
});

// Creare un nuovo piano alimentare
router.post('/piani-alimentari/nuovo', async (req, res) => {
  try {
    const { utenteId, titolo, descrizione, data, contenuto } = req.body;
     
    const pianoId = await pianiAlimentariDAO.insertPianoAlimentare(utenteId, titolo, descrizione, contenuto, data);
    
    res.json({ success: true, pianoId });
  } catch (error) {
    console.error('Errore nella creazione del piano alimentare:', error);
    req.session.error = 'Impossibile creare il piano alimentare';
    res.redirect('/admin/dashboard#pazienti');
  }
});

// Elimina un piano alimentare
router.post('/piani-alimentari/elimina', async (req, res) => {
  try {
    const { pianoId } = req.body;
     
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
