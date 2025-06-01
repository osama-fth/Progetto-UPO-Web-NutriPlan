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

router.get('/dashboard', (req, res) => {
  res.redirect('/admin/dashboard/pazienti');
});

router.get('/dashboard/:section', async (req, res) => {
  const section = req.params.section;
  const validSections = ['pazienti', 'recensioni', 'richieste-contatto', 'piani-paziente'];

  if (!validSections.includes(section)) {
    return res.redirect('/admin/dashboard/pazienti');
  }

  let pazientiFormattati = [];
  let recensioniFormattate = [];
  let richiesteFormattate = [];

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
router.get('/dashboard/pazienti/:utenteId/piani', async (req, res) => {
  const utenteId = req.params.utenteId;

  try {
    const pazienteSelezionato = await utentiDAO.getUserById(utenteId);

    if (!pazienteSelezionato) {
      req.flash('error', 'Paziente non trovato');
      return res.redirect('/admin/dashboard/pazienti');
    }

    const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(utenteId);
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
router.get('/dashboard/pazienti/:utenteId/piani/:pianoId', async (req, res) => {
  const utenteId = req.params.utenteId;
  const pianoId = req.params.pianoId;

  try {
    const pazienteSelezionato = await utentiDAO.getUserById(utenteId);
    if (!pazienteSelezionato) {
      req.flash('error', 'Paziente non trovato');
      return res.redirect('/admin/dashboard/pazienti');
    }

    const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(utenteId);
    pazienteSelezionato.pianiAlimentari = pianiAlimentari.map(p => {
      p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
      return p;
    });

    const pianoSelezionato = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);

    if (!pianoSelezionato || pianoSelezionato.utente_id != utenteId) {
      req.flash('error', 'Piano alimentare non trovato o non appartiene al paziente');
      return res.redirect(`/admin/dashboard/pazienti/${utenteId}/piani`);
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
    const utenteId = req.params.id;
    const misurazioni = await misurazioniDAO.getMisurazioniByUserId(utenteId);
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

// GET piano alimentare specifico dato id (per API)
router.get('/piani-alimentari/:id', async (req, res) => {
    const pianoId = req.params.id;
    try {
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

// Creare un nuovo piano alimentare
router.post('/piani-alimentari/nuovo', async (req, res) => {
  const { utenteId, titolo, descrizione, data, contenuto } = req.body;
  try {
    const pianoId = await pianiAlimentariDAO.insertPianoAlimentare(utenteId, titolo, descrizione, contenuto, data);
    res.json({ success: true, pianoId });
  } catch (error) {
    console.error('Errore nella creazione del piano alimentare:', error);
    res.status(500).json({ error: 'Errore nella creazione del piano alimentare' });
  }
});

// Elimina un piano alimentare
router.post('/piani-alimentari/elimina', async (req, res) => {
    const { pianoId } = req.body;
    try {
      const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
      await pianiAlimentariDAO.deletePianoAlimentare(pianoId);
      req.flash('success', 'Piano alimentare eliminato con successo');
      res.redirect(`/admin/dashboard/pazienti/${piano.utente_id}/piani`);
  } catch (error) {
    console.error('Errore nell\'eliminazione del piano alimentare:', error);
    req.flash('error', 'Impossibile eliminare il piano alimentare');
    res.redirect('/admin/dashboard/pazienti');
  }
});

// Download piano alimentare in PDF
router.get('/piani-alimentari/:id/download', async (req, res) => {
   const pianoId = req.params.id; 
   const doc = new PDFDocument({size: 'A4', margin: 50});
   try {
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=piano_alimentare_${pianoId}.pdf`);
    doc.pipe(res);
    
    const pdf = await PianoPDF.generaPianoPDF(doc, piano);
    if (!pdf) 
      {throw new Error('Errore nella generazione del PDF');}
  } catch (error) {
    console.error('Errore durante il download del piano:', error);
    req.flash('error', 'Errore durante il download del piano alimentare');
    res.redirect('/admin/dashboard/pazienti');
  }finally{
    doc.end();
  }
});

module.exports = router;
