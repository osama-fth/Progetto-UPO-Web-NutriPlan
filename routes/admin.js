'use strict';

const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const utentiDAO = require("../models/daos/utentiDAO");
const recensioniDAO = require("../models/daos/recensioniDAO");
const contattiDAO = require("../models/daos/contattiDAO");
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const pianiAlimentariDAO = require("../models/daos/pianiAlimentariDAO");
const middleware = require("../middleware/permessi");
const PDFDocument = require('pdfkit');
const PianoPDF = require("../models/pdfGenerator");

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

  // Carica i dati per la sezione corrente
  try {
    if (section === 'pazienti') {
      const pazienti = await utentiDAO.getAllPazienti();
      pazientiFormattati = pazienti.map(paziente => {
        paziente.data_formattata = dayjs(paziente.data_di_nascita).format('DD/MM/YYYY');
        return paziente;
      });
    }
    
    if (section === 'recensioni') {
      const recensioni = await recensioniDAO.getAllRecensioniWithUserInfo();
      recensioniFormattate = recensioni.map(recensione => {
        recensione.dataFormattata = dayjs(recensione.data_creazione).format('DD/MM/YYYY');
        return recensione;
      });
    }
    
    if (section === 'richieste-contatto') {
      const richieste = await contattiDAO.getAllRichiesteContatto();
      richiesteFormattate = richieste.map(richiesta => {
        richiesta.dataFormattata = dayjs(richiesta.data_creazione).format('DD/MM/YYYY');
        return richiesta;
      });
    }

    res.render("pages/admin_dashboard", {
      title: 'Dashboard Admin - NutriPlan',
      user: req.user,
      pazienti: pazientiFormattati,
      recensioni: recensioniFormattate,
      richieste: richiesteFormattate,
      pianoSelezionato: null,
      pazienteSelezionato: null,
      isAuth: req.isAuthenticated(),
      currentSection: section
    });
  } catch (err) {
    console.error("Errore nel rendering della pagina:", err);
    req.flash('error', "Errore durante la visualizzazione della dashboard");
    res.redirect("/error");
  }
});

// Visualizza piani alimentari di un paziente
router.get('/dashboard/pazienti/:pazienteId/piani', async (req, res) => {
  const pazienteId = req.params.pazienteId;
  
  try {
    // Recupera il paziente
    const pazienteSelezionato = await utentiDAO.getUserById(pazienteId);
    
    if (!pazienteSelezionato) {
      req.flash('error', 'Paziente non trovato');
      return res.redirect('/admin/dashboard/pazienti');
    }
    
    // Recupera i piani alimentari del paziente
    const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(pazienteId);
    pazienteSelezionato.pianiAlimentari = pianiAlimentari.map(p => {
      p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
      return p;
    });
    
    res.render("pages/admin_dashboard", {
      title: 'Dashboard Admin - Piani alimentari paziente - NutriPlan',
      user: req.user,
      pazienti: [],
      recensioni: [],
      richieste: [],
      pianoSelezionato: null,
      pazienteSelezionato: pazienteSelezionato,
      isAuth: req.isAuthenticated(),
      currentSection: 'piani-paziente'
    });
  } catch (err) {
    console.error("Errore nel caricamento del paziente:", err);
    req.flash('error', 'Errore nel caricamento dei dati');
    return res.redirect('/admin/dashboard/pazienti');
  }
});

// Visualizza un piano alimentare specifico di un paziente
router.get('/dashboard/pazienti/:pazienteId/piani/:pianoId', async (req, res) => {
  const pazienteId = req.params.pazienteId;
  const pianoId = req.params.pianoId;
  
  try {
    // Recupera il paziente
    const pazienteSelezionato = await utentiDAO.getUserById(pazienteId);
    
    if (!pazienteSelezionato) {
      req.flash('error', 'Paziente non trovato');
      return res.redirect('/admin/dashboard/pazienti');
    }
    
    // Recupera i piani alimentari del paziente
    const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(pazienteId);
    pazienteSelezionato.pianiAlimentari = pianiAlimentari.map(p => {
      p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
      return p;
    });
    
    // Recupera il piano specifico
    const pianoSelezionato = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    if (!pianoSelezionato || pianoSelezionato.utente_id != pazienteId) {
      req.flash('error', 'Piano alimentare non trovato o non appartiene al paziente');
      return res.redirect(`/admin/dashboard/pazienti/${pazienteId}/piani`);
    }
    
    pianoSelezionato.data_formattata = dayjs(pianoSelezionato.data_creazione).format('DD/MM/YYYY');
    
    if (typeof pianoSelezionato.contenuto === 'string') {
      pianoSelezionato.contenuto = JSON.parse(pianoSelezionato.contenuto);
    }
    
    pianoSelezionato.nome_paziente = pazienteSelezionato.nome;
    pianoSelezionato.cognome_paziente = pazienteSelezionato.cognome;
    
    res.render("pages/admin_dashboard", {
      title: 'Dashboard Admin - Visualizza piano alimentare - NutriPlan',
      user: req.user,
      pazienti: [],
      recensioni: [],
      richieste: [],
      pianoSelezionato: pianoSelezionato,
      pazienteSelezionato: pazienteSelezionato,
      isAuth: req.isAuthenticated(),
      currentSection: 'piani-paziente'
    });
  } catch (err) {
    console.error("Errore nel caricamento del piano:", err);
    req.flash('error', 'Errore nel caricamento dei dati');
    return res.redirect('/admin/dashboard/pazienti');
  }
});

// Eliminazione utente
router.post('/utenti/elimina', async (req, res) => {
  try {
    const { utenteId } = req.body;
    
    await utentiDAO.deleteAccount(utenteId);
    
    req.flash('success', 'Utente eliminato con successo');
    res.redirect('/admin/dashboard/pazienti');
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'utente:", error);
    req.flash('error', 'Impossibile eliminare l\'utente');
    res.redirect('/admin/dashboard/pazienti');
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
    res.status(500).json({ error: 'Errore nel recupero delle misurazioni' });
  }
});

// Elimina recensione
router.post('/recensioni/elimina', async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    await recensioniDAO.deleteRecensione(recensioneId);
    
    req.flash('success', 'Recensione eliminata con successo.');
    res.redirect('/admin/dashboard/recensioni');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.flash('error', 'Errore durante l\'eliminazione della recensione.');
    res.redirect('/admin/dashboard/recensioni');
  }
});

// Elimina richiesta di contatto
router.post('/contatti/elimina', async (req, res) => {
  try {
    const { richiestaId } = req.body;
    
    await contattiDAO.deleteRichiestaContatto(richiestaId);
    
    req.flash('success', 'Richiesta di contatto eliminata con successo.');
    res.redirect('/admin/dashboard/richieste-contatto');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della richiesta di contatto:', error);
    req.flash('error', 'Errore durante l\'eliminazione della richiesta di contatto.');
    res.redirect('/admin/dashboard/richieste-contatto');
  }
});

// GET piani alimentari di un paziente (per API)
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
    res.status(500).json({ error: 'Errore nel recupero dei piani alimentari' });
  }
});

// GET piano alimentare specifico dato id (per API)
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

// Visualizza piano alimentare - reindirizza alla nuova route
router.get('/piani-alimentari/:id/visualizza', async (req, res) => {
  try {
    const pianoId = req.params.id;
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    if (!piano) {
      req.flash('error', 'Piano alimentare non trovato');
      return res.redirect('/admin/dashboard/pazienti');
    }
    
    // Reindirizza alla nuova route basata su params
    res.redirect(`/admin/dashboard/pazienti/${piano.utente_id}/piani/${pianoId}`);
  } catch (error) {
    console.error('Errore durante la visualizzazione del piano:', error);
    req.flash('error', 'Errore durante la visualizzazione del piano');
    res.redirect('/admin/dashboard/pazienti');
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
    res.status(500).json({ error: 'Errore nella creazione del piano alimentare' });
  }
});

// Elimina un piano alimentare
router.post('/piani-alimentari/elimina', async (req, res) => {
  try {
    const { pianoId } = req.body;
    
    // Prima di eliminare, recupera l'ID del paziente per il redirect
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    const pazienteId = piano ? piano.utente_id : null;
    
    await pianiAlimentariDAO.deletePianoAlimentare(pianoId);
    req.flash('success', 'Piano alimentare eliminato con successo');
    
    if (pazienteId) {
      res.redirect(`/admin/dashboard/pazienti/${pazienteId}/piani`);
    } else {
      res.redirect('/admin/dashboard/pazienti');
    }
  } catch (error) {
    console.error('Errore nell\'eliminazione del piano alimentare:', error);
    req.flash('error', 'Impossibile eliminare il piano alimentare');
    res.redirect('/admin/dashboard/pazienti');
  }
});

// Download piano alimentare in PDF
router.get('/piani-alimentari/:id/download', async (req, res) => {
  try {
    const pianoId = req.params.id;
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    if (!piano) {
      req.flash('error', 'Piano alimentare non trovato');
      return res.redirect('/admin/dashboard/pazienti');
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=piano_alimentare_${pianoId}.pdf`);
    
    doc.pipe(res);
    
    try {
      const success = await PianoPDF.generaPianoPDF(doc, piano);
      
      if (!success) {
        throw new Error('Errore nella generazione del PDF');
      }
      
      doc.end();
    } catch (pdfError) {
      console.error('Errore durante la generazione del PDF:', pdfError);
      doc.end();
      throw pdfError;
    }
    
  } catch (error) {
    console.error('Errore durante il download del piano:', error);
    req.flash('error', 'Errore durante il download del piano alimentare');
    res.redirect('/admin/dashboard/pazienti');
  }
});

// Vecchia route - reindirizza alla nuova
router.get('/pazienti/:id/visualizza-piani', (req, res) => {
  const pazienteId = req.params.id;
  res.redirect(`/admin/dashboard/pazienti/${pazienteId}/piani`);
});

module.exports = router;
