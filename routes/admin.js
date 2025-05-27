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
    // Aggiungiamo una variabile per il piano selezionato (se presente)
    let pianoSelezionato = null;
    let pazienteSelezionato = null;

    // Verifichiamo se è stato richiesto un piano specifico
    const pianoId = req.query.piano_id;
    const pazienteId = req.query.paziente_id;
    
    if (pianoId) {
        try {
            pianoSelezionato = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
            if (pianoSelezionato && pianoSelezionato.contenuto) {
                // Convertiamo il contenuto JSON in oggetto se è una stringa
                if (typeof pianoSelezionato.contenuto === 'string') {
                    pianoSelezionato.contenuto = JSON.parse(pianoSelezionato.contenuto);
                }
                // Otteniamo anche i dettagli del paziente associato
                const paziente = await utentiDAO.getUserById(pianoSelezionato.utente_id);
                if (paziente) {
                    pianoSelezionato.nome_paziente = paziente.nome;
                    pianoSelezionato.cognome_paziente = paziente.cognome;
                }
            }
        } catch (err) {
            console.error("Errore nel caricamento del piano alimentare:", err);
        }
    }
    
    // Se è stato richiesto un paziente specifico, carica i suoi piani
    if (pazienteId) {
        try {
            pazienteSelezionato = await utentiDAO.getUserById(pazienteId);
            if (pazienteSelezionato) {
                const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(pazienteId);
                pazienteSelezionato.pianiAlimentari = pianiAlimentari.map(p => {
                    p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
                    return p;
                });
            }
        } catch (err) {
            console.error("Errore nel caricamento del paziente:", err);
        }
    }

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

    try {
        res.render("pages/admin_dashboard", { 
            title: 'Dashboard Admin - NutriPlan',
            user: req.user, 
            pazienti: pazientiFormattati,
            recensioni: recensioniFormattate,
            richieste: richiesteFormattate,
            pianoSelezionato: pianoSelezionato,
            pazienteSelezionato: pazienteSelezionato,
            isAuth: req.isAuthenticated(),
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

// Nuova route per visualizzare i piani alimentari di un paziente
router.get('/pazienti/:id/visualizza-piani', async (req, res) => {
    try {
        const pazienteId = req.params.id;
        const paziente = await utentiDAO.getUserById(pazienteId);
        
        if (!paziente) {
            req.session.error = 'Paziente non trovato';
            return res.redirect('/admin/dashboard/pazienti');
        }
        
        const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(pazienteId);
        const pianiFormattati = pianiAlimentari.map(p => {
            p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
            return p;
        });
        
        // Redirect alla dashboard con parametri per visualizzare i piani
        res.redirect(`/admin/dashboard/pazienti?paziente_id=${pazienteId}`);
    } catch (error) {
        console.error('Errore nel recupero dei piani alimentari:', error);
        req.session.error = 'Impossibile recuperare i piani alimentari';
        res.redirect('/admin/dashboard/pazienti');
    }
});

// Nuova route per visualizzare un piano alimentare specifico
router.get('/piani-alimentari/:id/visualizza', async (req, res) => {
    try {
        const pianoId = req.params.id;
        const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
        
        if (!piano) {
            req.session.error = 'Piano alimentare non trovato';
            return res.redirect('/admin/dashboard/pazienti');
        }
        
        // Inizializza array vuoti per garantire coerenza con la vista
        let pazientiFormattati = [];
        let recensioniFormattate = [];
        let richiesteFormattate = [];
        
        // Formatta la data usando dayjs
        if (piano.data_creazione) {
          piano.data_formattata = dayjs(piano.data_creazione).format('DD/MM/YYYY');
        } else {
          piano.data_formattata = 'Data non disponibile';
        }
        
        // Convertiamo il contenuto JSON in oggetto se è una stringa
        if (piano.contenuto && typeof piano.contenuto === 'string') {
            piano.contenuto = JSON.parse(piano.contenuto);
        }
        
        // Otteniamo i dettagli del paziente associato
        if (piano.utente_id) {
            const paziente = await utentiDAO.getUserById(piano.utente_id);
            if (paziente) {
                piano.nome_paziente = paziente.nome;
                piano.cognome_paziente = paziente.cognome;
            }
        }
        
        res.render('pages/admin_dashboard', {
          title: 'Dashboard Admin - NutriPlan',
          user: req.user,
          pazienti: pazientiFormattati,
          recensioni: recensioniFormattate,
          richieste: richiesteFormattate,
          pianoSelezionato: piano,
          pazienteSelezionato: null,
          isAuth: req.isAuthenticated(),
          currentSection: 'pazienti'
        });
        
    } catch (err) {
        console.error('Errore durante la visualizzazione del piano:', err);
        req.session.error = 'Errore durante la visualizzazione del piano';
        res.redirect('/admin/dashboard/pazienti');
    }
});

module.exports = router
