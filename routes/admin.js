'use strict';

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const bcrypt = require('bcrypt');
const utentiDAO = require('../models/dao/utenti-dao');
const recensioniDAO = require('../models/dao/recensioni-dao');
const contattiDAO = require('../models/dao/contatti-dao');
const misurazioniDAO = require('../models/dao/misurazioni-dao');
const pianiAlimentariDAO = require('../models/dao/piani-alimentari-dao');
const authMiddleware = require('../middleware/autorizzazioni');
const PDFDocument = require('pdfkit');
const PianoPDF = require('../models/pdf-generator');

// Applica middleware di controllo permessi admin
router.use(authMiddleware.isAdmin);

// Rotta di redirect alla dashboard principale
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard/pazienti');
});

router.get('/dashboard', (req, res) => {
  res.redirect('/admin/dashboard/pazienti');
});

// Visualizza dashboard admin con sezioni diverse (pazienti, recensioni, contatti, etc.)
router.get('/dashboard/:section', async (req, res) => {
  const section = req.params.section;
  const validSections = [
    'pazienti',
    'recensioni',
    'richieste-contatto',
    'piani-paziente',
    'impostazioni',
  ];

  if (!validSections.includes(section)) {
    return res.redirect('/admin/dashboard/pazienti');
  }

  let pazientiFormattati = [];
  let recensioniFormattate = [];
  let richiesteFormattate = [];

  try {
    if (section === 'pazienti') {
      const pazienti = await utentiDAO.getAllPazienti();
      pazientiFormattati = pazienti.map((paziente) => {
        paziente.data_formattata = dayjs(paziente.data_di_nascita).format('DD/MM/YYYY');
        return paziente;
      });
    }

    if (section === 'recensioni') {
      const recensioni = await recensioniDAO.getAllRecensioni();
      recensioniFormattate = recensioni.map((recensione) => {
        recensione.dataFormattata = dayjs(recensione.data_creazione).format('DD/MM/YYYY');
        return recensione;
      });
    }

    if (section === 'richieste-contatto') {
      const richieste = await contattiDAO.getAllRichiesteContatto();
      richiesteFormattate = richieste.map((richiesta) => {
        richiesta.dataFormattata = dayjs(richiesta.data_creazione).format('DD/MM/YYYY');
        return richiesta;
      });
    }

    // Assicurati che la view abbia accesso a tutti i dati necessari
    res.render('pages/admin-dashboard', {
      title: 'NutriPlan - Dashboard Admin',
      user: req.user,
      pazienti: pazientiFormattati,
      recensioni: recensioniFormattate,
      richieste: richiesteFormattate,
      pazienteSelezionato: null,
      isAuth: req.isAuthenticated(),
      currentSection: section,
    });
  } catch (err) {
    console.error('Errore nel rendering della pagina:', err);
    req.flash('error', 'Errore durante la visualizzazione della dashboard');
    res.redirect('/error');
  }
});

// Visualizza piani alimentari di un paziente specifico
router.get('/dashboard/pazienti/:utenteId/piani', async (req, res) => {
  const utenteId = req.params.utenteId;

  try {
    const pazienteSelezionato = await utentiDAO.getUserById(utenteId);

    if (!pazienteSelezionato) {
      req.flash('error', 'Paziente non trovato');
      return res.redirect('/admin/dashboard/pazienti');
    }

    const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(utenteId);
    pazienteSelezionato.pianiAlimentari = pianiAlimentari.map((p) => {
      p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
      return p;
    });

    res.render('pages/admin-dashboard', {
      title: 'Nutriplan - Dashboard Admin - Piani alimentari paziente',
      user: req.user,
      pazienti: [],
      recensioni: [],
      richieste: [],
      pazienteSelezionato,
      isAuth: req.isAuthenticated(),
      currentSection: 'piani-paziente',
    });
  } catch (err) {
    console.error('Errore nel caricamento del paziente:', err);
    req.flash('error', 'Errore nel caricamento dei dati');
    return res.redirect('/admin/dashboard/pazienti');
  }
});

// Visualizza dettagli di un piano alimentare specifico
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
    pazienteSelezionato.pianiAlimentari = pianiAlimentari.map((p) => {
      p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
      return p;
    });

    const pianoSelezionato = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);

    if (!pianoSelezionato || pianoSelezionato.utente_id !== utenteId) {
      req.flash('error', 'Piano alimentare non trovato o non appartiene al paziente');
      return res.redirect(`/admin/dashboard/pazienti/${utenteId}/piani`);
    }

    pianoSelezionato.data_formattata = dayjs(pianoSelezionato.data_creazione).format('DD/MM/YYYY');

    if (typeof pianoSelezionato.contenuto === 'string') {
      pianoSelezionato.contenuto = JSON.parse(pianoSelezionato.contenuto);
    }

    pianoSelezionato.nome_paziente = pazienteSelezionato.nome;
    pianoSelezionato.cognome_paziente = pazienteSelezionato.cognome;

    res.render('pages/admin-dashboard', {
      title: 'NutriPlan - Dashboard Admin - Visualizza piano alimentare ',
      user: req.user,
      pazienti: [],
      recensioni: [],
      richieste: [],
      pianoSelezionato,
      pazienteSelezionato,
      isAuth: req.isAuthenticated(),
      currentSection: 'piani-paziente',
    });
  } catch (err) {
    console.error('Errore nel caricamento del piano:', err);
    req.flash('error', 'Errore nel caricamento dei dati');
    return res.redirect('/admin/dashboard/pazienti');
  }
});

// Elimina un utente paziente
router.delete('/utenti/elimina', async (req, res) => {
  try {
    const { utenteId } = req.body;
    await utentiDAO.deleteAccount(utenteId);
    req.flash('success', 'Utente eliminato con successo');
    res.redirect('/admin/dashboard/pazienti');
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'utente:", error);
    req.flash('error', "Impossibile eliminare l'utente");
    res.redirect('/admin/dashboard/pazienti');
  }
});

// Recupera misurazioni di un paziente
router.get('/pazienti/:id/misurazioni', async (req, res) => {
  try {
    const utenteId = req.params.id;
    const misurazioni = await misurazioniDAO.getMisurazioniByUserId(utenteId);
    const misurazioniFormattate = misurazioni.map((m) => ({
      id: m.id,
      misura: m.misura,
      dataFormattata: dayjs(m.data).format('DD/MM/YYYY'),
      data: m.data,
    }));
    res.json(misurazioniFormattate);
  } catch (error) {
    console.error('Errore nel recupero delle misurazioni:', error);
    res.status(500).json({ error: 'Errore nel recupero delle misurazioni' });
  }
});

// Elimina una recensione
router.delete('/recensioni/elimina', async (req, res) => {
  try {
    const { recensioneId } = req.body;
    await recensioniDAO.deleteRecensione(recensioneId);
    req.flash('success', 'Recensione eliminata con successo.');
    res.redirect('/admin/dashboard/recensioni');
  } catch (error) {
    console.error("Errore durante l'eliminazione della recensione:", error);
    req.flash('error', "Errore durante l'eliminazione della recensione.");
    res.redirect('/admin/dashboard/recensioni');
  }
});

// Elimina una richiesta di contatto
router.delete('/contatti/elimina', async (req, res) => {
  try {
    const { richiestaId } = req.body;
    await contattiDAO.deleteRichiestaContatto(richiestaId);
    req.flash('success', 'Richiesta di contatto eliminata con successo.');
    res.redirect('/admin/dashboard/richieste-contatto');
  } catch (error) {
    console.error("Errore durante l'eliminazione della richiesta di contatto:", error);
    req.flash('error', "Errore durante l'eliminazione della richiesta di contatto.");
    res.redirect('/admin/dashboard/richieste-contatto');
  }
});

// Recupera piano alimentare per ID
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

// Crea nuovo piano alimentare per un paziente
router.post('/piani-alimentari/nuovo', async (req, res) => {
  const { utenteId, titolo, descrizione, data, contenuto } = req.body;

  try {
    const pianoId = await pianiAlimentariDAO.insertPianoAlimentare(
      utenteId,
      titolo,
      descrizione,
      contenuto,
      data,
    );
    res.json({ success: true, pianoId });
  } catch (error) {
    console.error('Errore nella creazione del piano alimentare:', error);
    res.status(500).json({ error: 'Errore nella creazione del piano alimentare' });
  }
});

// Elimina un piano alimentare
router.delete('/piani-alimentari/elimina', async (req, res) => {
  const { pianoId } = req.body;
  try {
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    await pianiAlimentariDAO.deletePianoAlimentare(pianoId);
    req.flash('success', 'Piano alimentare eliminato con successo');
    res.redirect(`/admin/dashboard/pazienti/${piano.utente_id}/piani`);
  } catch (error) {
    console.error("Errore nell'eliminazione del piano alimentare:", error);
    req.flash('error', 'Impossibile eliminare il piano alimentare');
    res.redirect('/admin/dashboard/pazienti');
  }
});

// Download piano alimentare in formato PDF
router.get('/piani-alimentari/:id/download', async (req, res) => {
  const pianoId = req.params.id;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  try {
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=piano_alimentare_${pianoId}.pdf`);
    doc.pipe(res);

    const pdf = await PianoPDF.generaPianoPDF(doc, piano);
    if (!pdf) {
      throw new Error('Errore nella generazione del PDF');
    }
  } catch (error) {
    console.error('Errore durante il download del piano:', error);
    req.flash('error', 'Errore durante il download del piano alimentare');
    res.redirect('/admin/dashboard/pazienti');
  } finally {
    doc.end();
  }
});

// Ricerca pazienti per nome/cognome
router.get('/dashboard/pazienti/search', async (req, res) => {
  const query = req.query.q || '';

  try {
    let pazienti = [];

    if (query.trim() !== '') {
      pazienti = await utentiDAO.searchPazienti(query);
    } else {
      pazienti = await utentiDAO.getAllPazienti();
    }

    const pazientiFormattati = pazienti.map((paziente) => {
      paziente.data_formattata = dayjs(paziente.data_di_nascita).format('DD/MM/YYYY');
      return paziente;
    });

    res.render('pages/admin-dashboard', {
      title: 'NutriPlan - Dashboard Admin',
      currentSection: 'pazienti',
      pazienti: pazientiFormattati,
      query,
      user: req.user || null,
    });
  } catch (error) {
    console.error('Errore durante la ricerca dei pazienti:', error);
    req.flash('error', 'Errore durante la ricerca dei pazienti');
    res.redirect('/admin/dashboard/pazienti');
  }
});

// Cambio password dell'admin
router.put(
  '/account/cambia-password',
  [
    check('password_attuale').notEmpty().withMessage('La password attuale è obbligatoria'),
    check('nuova_password')
      .notEmpty()
      .withMessage('La nuova password è obbligatoria')
      .isLength({ min: 8 })
      .withMessage('La password deve essere lunga almeno 8 caratteri'),
    check('conferma_password')
      .notEmpty()
      .withMessage('La conferma password è obbligatoria')
      .custom((value, { req }) => {
        if (value !== req.body.nuova_password) {
          throw new Error('Le password non coincidono');
        }
        return true;
      }),
  ],
  async (req, res) => {
    const { password_attuale, nuova_password } = req.body;
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        req.flash('error', errors.array());
        return res.redirect('/admin/dashboard/impostazioni');
      }
      const user = await utentiDAO.getUserById(req.user.id);
      const isMatch = await bcrypt.compare(password_attuale, user.password);
      if (!isMatch) {
        req.flash('error', 'La password attuale non è corretta');
        return res.redirect('/admin/dashboard/impostazioni');
      }
      const hashedPassword = await bcrypt.hash(nuova_password, 10);
      await utentiDAO.updatePassword(req.user.id, hashedPassword);
      req.flash('success', 'Password aggiornata con successo');
      res.redirect('/admin/dashboard/impostazioni');
    } catch (error) {
      console.error('Errore durante il cambio password:', error);
      req.flash('error', 'Si è verificato un errore durante il cambio password');
      res.redirect('/admin/dashboard/impostazioni');
    }
  },
);

module.exports = router;
