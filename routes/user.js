'use strict'
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const recensioniDAO = require("../models/daos/recensioniDAO");
const pianiAlimentariDAO = require("../models/daos/pianiAlimentariDAO");
const utentiDAO = require("../models/daos/utentiDAO");
const middleware = require("../middleware/permessi");
const PDFDocument = require('pdfkit');
const PianoPDF  = require("../models/pdfGenerator");

router.use(middleware.isPaziente);

// Rotta base che reindirizza alla vista misurazioni
router.get('/dashboard', (req, res) => {
  res.redirect('/user/dashboard/misurazioni');
});

// Rotte specifiche per le diverse sezioni della dashboard
router.get('/dashboard/:section', async (req, res) => {  
  const section = req.params.section;
  const validSections = ['misurazioni', 'piani-alimentari', 'recensioni', 'impostazioni'];
  
  if (!validSections.includes(section)) {
    return res.redirect('/user/dashboard/misurazioni');
  }
  
  let misurazioniFormattate = [];
  let recensione = null;
  let pianiAlimentariFormattati = [];
    
  try {
    const misurazioni = await misurazioniDAO.getMisurazioniByUserId(req.user.id);
        
    misurazioniFormattate = misurazioni.map(m => {
      m.dataFormattata = dayjs(m.data).format('DD/MM/YYYY');
      m.data_iso = dayjs(m.data).format('YYYY-MM-DD');
      return m;
    });
  } catch (err) {
    console.error("Errore nel recupero delle misurazioni:", err);
    req.flash('error', "Impossibile caricare le misurazioni");
  }
    
  try {
    recensione = await recensioniDAO.getRecensioneByUserId(req.user.id);

    if (recensione && recensione.data_creazione) {
      recensione.dataFormattata = dayjs(recensione.data_creazione).format('DD/MM/YYYY');
    }
  } catch (err) {
    console.error("Errore nel recupero delle recensioni:", err);
    req.flash('error', "Impossibile caricare la recensione");
  }

  try {
    const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(req.user.id);
    pianiAlimentariFormattati = pianiAlimentari.map(p => {
      p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
      return p;
    });
  } catch (err) {
    console.error("Errore nel recupero dei piani alimentari:", err);
    req.flash('error', "Impossibile caricare i piani alimentari");
  }

  try {
    res.render('pages/utente_dashboard', {
      title: 'NutriPlan - Dashboard',
      user: req.user,
      isAuth: req.isAuthenticated(),
      misurazioni: misurazioniFormattate,
      recensione: recensione,
      pianiAlimentari: pianiAlimentariFormattati,
      currentSection: section
    });
  } catch (err) {
    console.log("Errore nel rendering della pagina:", err);
    req.flash('error', "Errore durante la visualizzazione della dashboard");
    res.redirect("/error");
  }
});

// Nuova misurazione
router.post('/misurazioni/nuova', async (req, res) => {
  try {
    const { peso, data } = req.body;
    
    if (!peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
      req.flash('error', 'I dati inseriti non sono validi.');
      return res.redirect('/user/dashboard/misurazioni');
    }
    
    await misurazioniDAO.insertMisurazione(req.user.id, parseFloat(peso), data);
    
    req.flash('success', 'Misurazione aggiunta con successo.');
    res.redirect('/user/dashboard/misurazioni');
  } catch (err) {
    console.error("Errore nell'inserimento della misurazione:", err);
    req.flash('error', 'Impossibile modificare la misurazione.');
    res.redirect('/user/dashboard/misurazioni');
  }
});

// Modifica misurazione
router.post('/misurazioni/modifica', async (req, res) => {
  try {
    const { misurazioneId, peso, data } = req.body;
    
    if (!peso || !data || isNaN(parseFloat(peso)) || parseFloat(peso) <= 0) {
      req.flash('error', 'I dati inseriti non sono validi.');
      return res.redirect('/user/dashboard/misurazioni');
    }
            
    await misurazioniDAO.updateMisurazione(misurazioneId, parseFloat(peso), data);
    
    req.flash('success', 'Misurazione aggiornata con successo.');
    res.redirect('/user/dashboard/misurazioni');
  } catch (err) {
    console.error("Errore durante la modifica della misurazione:", err);
    req.flash('error', 'Si è verificato un errore durante la modifica della misurazione.');
    res.redirect('/user/dashboard/misurazioni');
  }
});

// Elimina misurazione
router.get('/misurazioni/elimina/:id', async (req, res) => {
  try {
    const misurazioneId = req.params.id;
    
    const misurazione = await misurazioniDAO.getMisurazioneById(misurazioneId);
    if (!misurazione || misurazione.utente_id !== req.user.id) {
      req.flash('error', 'Misurazione non trovata o non autorizzata');
      return res.redirect('/user/dashboard/misurazioni');
    }
    
    await misurazioniDAO.deleteMisurazione(misurazioneId);
    
    req.flash('success', 'Misurazione eliminata con successo.');
    res.redirect('/user/dashboard/misurazioni');
  } catch (err) {
    console.error("Errore durante l'eliminazione della misurazione:", err);
    req.flash('error', 'Si è verificato un errore durante l\'eliminazione della misurazione.');
    res.redirect('/user/dashboard/misurazioni');
  }
});

// Nuova recensione
router.post('/recensioni/nuova', async (req, res) => {
  try {
    const { commento, valutazione } = req.body;
    
    if (!commento || commento.trim() === '') {
      req.flash('error', 'Il testo della recensione non può essere vuoto.');
      return res.redirect('/user/dashboard/recensioni');
    }
    
    const voto = parseInt(valutazione) || 3;
    if (voto < 1 || voto > 5) {
      req.flash('error', 'La valutazione deve essere un numero da 1 a 5.');
      return res.redirect('/user/dashboard/recensioni');
    }

    await recensioniDAO.insertRecensione(req.user.id, commento.trim(), voto);
    
    req.flash('success', 'Recensione pubblicata con successo.');
    res.redirect('/user/dashboard/recensioni');
  } catch (error) {
    console.error('Errore durante l\'aggiunta della recensione:', error);
    req.flash('error', 'Errore durante la gestione della recensione.');
    res.redirect('/user/dashboard/recensioni');
  }
});

// Elimina recensione
router.post('/recensioni/cancella', async (req, res) => {
  try {
    const { recensioneId } = req.body;
    
    const recensione = await recensioniDAO.getRecensioneById(recensioneId);
    if (!recensione || recensione.utente_id !== req.user.id) {
      req.flash('error', 'Recensione non trovata o non autorizzata');
      return res.redirect('/user/dashboard/recensioni');
    }
    
    await recensioniDAO.deleteRecensione(recensioneId);
    
    req.flash('success', 'Recensione eliminata con successo.');
    res.redirect('/user/dashboard/recensioni');
  } catch (error) {
    console.error('Errore durante l\'eliminazione della recensione:', error);
    req.flash('error', 'Errore durante la gestione della recensione.');
    res.redirect('/user/dashboard/recensioni');
  }
});

//Elimina account
router.get('/account/elimina', async (req, res) => {
  try {
    const utenteId = req.user.id;
    await utentiDAO.deleteAccount(utenteId);
    
    req.logout(function(err) {
      if (err) { 
        console.error("Errore durante il logout:", err);
      }
      
      req.flash('success', 'Account eliminato con successo.');
      res.redirect('/auth/login');
    });
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'account:", error);
    req.flash('error', 'Impossibile eliminare l\'elemento selezionato.');
    res.redirect('/user/dashboard');
  }
});

// Modifica dati personali
router.post('/account/aggiorna-dati', [
  check('nome').notEmpty().matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il nome può contenere solo lettere'),
  check('cognome').notEmpty().withMessage('Il cognome è obbligatorio').matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il cognome può contenere solo lettere'),
  check('data_di_nascita').notEmpty().withMessage('La data di nascita è obbligatoria').isDate().withMessage('Formato data non valido')
  ], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/user/dashboard/impostazioni');
    }
    
    const { nome, cognome, data_di_nascita } = req.body;
    const userId = req.user.id;
    
    await utentiDAO.updateUserData(userId, nome, cognome, data_di_nascita);
    
    req.flash('success', 'Dati aggiornati con successo');
    res.redirect('/user/dashboard/impostazioni');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei dati:', error);
    req.flash('error', 'Si è verificato un errore durante l\'aggiornamento dei dati');
    res.redirect('/user/dashboard/impostazioni');
  }
});

// Modifica password
router.post('/account/cambia-password', [
  check('password_attuale').notEmpty().withMessage('La password attuale è obbligatoria'),
  check('nuova_password').notEmpty().withMessage('La nuova password è obbligatoria').isLength({ min: 8 }).withMessage('La password deve essere lunga almeno 8 caratteri'),
  check('conferma_password').notEmpty().withMessage('La conferma password è obbligatoria')
    .custom((value, { req }) => {
      if (value !== req.body.nuova_password) {throw new Error('Le password non coincidono');}
      return true;
    })
  ], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/user/dashboard/impostazioni');
    }
    
    const { password_attuale, nuova_password } = req.body;
    const userId = req.user.id;
    
    const user = await utentiDAO.getUserById(userId);
    const isMatch = await bcrypt.compare(password_attuale, user.password);
    
    if (!isMatch) {
      req.flash('error', 'La password attuale non è corretta');
      return res.redirect('/user/dashboard/impostazioni');
    }
    
    const hashedPassword = await bcrypt.hash(nuova_password, 10);
    
    await utentiDAO.updatePassword(userId, hashedPassword);
    
    req.flash('success', 'Password aggiornata con successo');
    res.redirect('/user/dashboard/impostazioni');
  } catch (error) {
    console.error('Errore durante il cambio password:', error);
    req.flash('error', 'Si è verificato un errore durante il cambio password');
    res.redirect('/user/dashboard/impostazioni');
  }
});

// Download piano alimentare
router.get('/piani-alimentari/download/:id', async (req, res) => {
  try {
    const pianoId = req.params.id;
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    // Verifica proprietà e autorizzazioni
    if (!piano || piano.utente_id !== req.user.id) {
      req.flash('error', 'Piano alimentare non trovato o non autorizzato');
      return res.redirect('/user/dashboard/piani-alimentari');
    }

    // Crea il documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Imposta gli header per il download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=piano_alimentare_${pianoId}.pdf`);
    
    // Pipe il PDF alla risposta
    doc.pipe(res);
    
    try {
      // Genera il contenuto del PDF
      const success = await PianoPDF.generaPianoPDF(doc, piano);
      
      if (!success) {
        throw new Error('Errore nella generazione del PDF');
      }
      
      // Finalizza e chiudi il documento
      doc.end();
    } catch (pdfError) {
      console.error('Errore durante la generazione del PDF:', pdfError);
      doc.end(); // Assicurati di chiudere il documento anche in caso di errore
      throw pdfError; // Rilancia l'errore per essere gestito dal catch esterno
    }
    
  } catch (error) {
    console.error('Errore durante il download del piano:', error);
    req.flash('error', 'Errore durante il download del piano alimentare');
    res.redirect('/user/dashboard/piani-alimentari');
  }
});

// Route generica per ottenere i dettagli del piano
router.get('/piani-alimentari/:id', async (req, res) => {
  try {
    const pianoId = req.params.id;
    const userId = req.user.id;
    
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    if (!piano || piano.utente_id !== userId) {
      return res.json({ error: 'Piano non trovato' });
    }
    
    res.json({
      id: piano.id,
      titolo: piano.titolo,
      descrizione: piano.descrizione,
      data: piano.data_creazione,
      dataFormattata: dayjs(piano.data_creazione).format('DD/MM/YYYY'),
      contenuto: piano.contenuto
    });
  } catch (error) {
    console.error('Errore durante il recupero del piano alimentare:', error);
    res.status(500).json({ error: 'Errore durante il recupero del piano alimentare' });
  }
});

module.exports = router;
