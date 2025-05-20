'use strict'
const express = require("express");
const router = express.Router();
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator"); // Modificato per usare check
const misurazioniDAO = require("../models/daos/misurazioniDAO");
const recensioniDAO = require("../models/daos/recensioniDAO");
const pianiAlimentariDAO = require("../models/daos/pianiAlimentariDAO");
const utentiDAO = require("../models/daos/utentiDAO");
const middleware = require("../middleware/permessi");

router.use(middleware.isPaziente);

// Dashboard principale dell'utente
router.get('/dashboard', async (req, res) => {
    // Formatta la data di nascita dell'utente
    const userWithFormattedDate = {...req.user};
    userWithFormattedDate.dataFormattata = dayjs(req.user.data_di_nascita).format('DD/MM/YYYY');

    let misurazioniFormattate = [];
    let recensione = null;
    let pianiAlimentariFormattati = [];
    
    // Recupera le misurazioni dell'utente
    try {
        const misurazioni = await misurazioniDAO.getMisurazioniByUserId(req.user.id);
        
        misurazioniFormattate = misurazioni.map(m => {
            m.dataFormattata = dayjs(m.data).format('DD/MM/YYYY');
            m.data_iso = dayjs(m.data).format('YYYY-MM-DD');
            return m;
        });
    } catch (err) {
        console.error("Errore nel recupero delle misurazioni:", err);
        req.session.error = "Impossibile caricare le misurazioni"; // Aggiunto messaggio di errore
    }
    
    // Recupera la recensione dell'utente
    try {
        recensione = await recensioniDAO.getRecensioneByUserId(req.user.id);
        if (recensione) {
            recensione.dataFormattata = dayjs(recensione.data_creazione).format('DD/MM/YYYY');
        }
    } catch (err) {
        console.error("Errore nel recupero delle recensioni:", err);
        req.session.error = "Impossibile caricare la recensione"; // Aggiunto messaggio di errore
    }

    // Recupera i piani alimentari dell'utente
    try {
        const pianiAlimentari = await pianiAlimentariDAO.getPianiAlimentariByUserId(req.user.id);
        pianiAlimentariFormattati = pianiAlimentari.map(p => {
            p.dataFormattata = dayjs(p.data_creazione).format('DD/MM/YYYY');
            return p;
        });
    } catch (err) {
        console.error("Errore nel recupero dei piani alimentari:", err);
        req.session.error = "Impossibile caricare i piani alimentari"; // Aggiunto messaggio di errore
    }

    // Recupera messaggi dalla sessione
    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;

    try {
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
        console.log("Errore nel rendering della pagina:", err);
        req.session.error = "Errore durante la visualizzazione della dashboard";
        res.redirect("/error");
    }
});

// POST nuova misurazione
router.post('/misurazioni/nuova', async (req, res) => {
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
router.post('/misurazioni/modifica', async (req, res) => {
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
router.get('/misurazioni/elimina/:id', async (req, res) => {
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
router.post('/recensioni/nuova', async (req, res) => {
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
router.post('/recensioni/cancella', async (req, res) => {
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
router.get('/account/elimina', async (req, res) => {
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

// Rotta per aggiornare i dati utente con validazione integrata
router.post('/account/aggiorna-dati', [
  check('nome')
    .notEmpty().withMessage('Il nome è obbligatorio')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il nome può contenere solo lettere'),
  
  check('cognome')
    .notEmpty().withMessage('Il cognome è obbligatorio')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il cognome può contenere solo lettere'),
  
  check('data_di_nascita')
    .notEmpty().withMessage('La data di nascita è obbligatoria')
    .isDate().withMessage('Formato data non valido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array()[0].msg;
      return res.redirect('/user/dashboard#impostazioni');
    }
    
    const { nome, cognome, data_di_nascita } = req.body;
    const userId = req.user.id;
    
    await utentiDAO.updateUserData(userId, nome, cognome, data_di_nascita);
    
    req.session.success = 'Dati aggiornati con successo';
    res.redirect('/user/dashboard#impostazioni');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei dati:', error);
    req.session.error = 'Si è verificato un errore durante l\'aggiornamento dei dati';
    res.redirect('/user/dashboard#impostazioni');
  }
});

// Rotta per cambiare la password con validazione integrata
router.post('/account/cambia-password', [
  check('password_attuale')
    .notEmpty().withMessage('La password attuale è obbligatoria'),
  
  check('nuova_password')
    .notEmpty().withMessage('La nuova password è obbligatoria')
    .isLength({ min: 8 }).withMessage('La password deve essere lunga almeno 8 caratteri'),
    
  check('conferma_password')
    .notEmpty().withMessage('La conferma password è obbligatoria')
    .custom((value, { req }) => {
      if (value !== req.body.nuova_password) {
        throw new Error('Le password non coincidono');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array()[0].msg;
      return res.redirect('/user/dashboard#impostazioni');
    }
    
    const { password_attuale, nuova_password } = req.body;
    const userId = req.user.id;
    
    // Verifica password attuale
    const user = await utentiDAO.getUserById(userId);
    const isMatch = await bcrypt.compare(password_attuale, user.password);
    
    if (!isMatch) {
      req.session.error = 'La password attuale non è corretta';
      return res.redirect('/user/dashboard#impostazioni');
    }
    
    // Hash della nuova password
    const hashedPassword = await bcrypt.hash(nuova_password, 10);
    
    // Aggiornamento nel DB
    await utentiDAO.updatePassword(userId, hashedPassword);
    
    req.session.success = 'Password aggiornata con successo';
    res.redirect('/user/dashboard#impostazioni');
  } catch (error) {
    console.error('Errore durante il cambio password:', error);
    req.session.error = 'Si è verificato un errore durante il cambio password';
    res.redirect('/user/dashboard#impostazioni');
  }
});

// Route per ottenere un piano alimentare specifico dell'utente
router.get('/piani-alimentari/:id', async (req, res) => {
  try {
    const pianoId = req.params.id;
    const userId = req.user.id; // ID dell'utente corrente
    
    // Recupera il piano dal database assicurandosi che appartenga all'utente corrente
    const piano = await pianiAlimentariDAO.getPianoAlimentareById(pianoId);
    
    if (!piano || piano.utente_id !== userId) {
      return res.status(404).json({ error: 'Piano non trovato' });
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
    console.error('Errore nel recupero del piano:', error);
    res.status(500).json({ error: 'Errore nel server' });
  }
});

module.exports = router;
