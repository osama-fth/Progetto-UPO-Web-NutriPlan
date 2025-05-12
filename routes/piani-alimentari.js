const express = require('express');
const router = express.Router();
const dao = require('../models/dao');

// Visualizza il dettaglio di un piano alimentare
router.get('/visualizza/:id', isLoggedIn, async (req, res) => {
    try {
        const pianoId = req.params.id;
        const piano = await dao.getPianoAlimentareById(pianoId);
        
        // Verifica che il piano appartenga all'utente corrente
        if (!piano || piano.utente_id !== req.user.id) {
            return res.status(403).redirect('/utenteDashboard?alert=errore&errorType=accesso_negato');
        }
        
        res.render('pages/piano-dettaglio', { piano });
    } catch (error) {
        console.error('Errore durante il recupero del piano alimentare:', error);
        res.redirect('/utenteDashboard?alert=errore&errorType=errore_caricamento');
    }
});

// Scarica un piano alimentare
router.get('/scarica/:id', isLoggedIn, async (req, res) => {
    try {
        const pianoId = req.params.id;
        const piano = await dao.scaricaPianoAlimentare(pianoId, req.user.id);
        
        if (!piano) {
            return res.status(404).redirect('/utenteDashboard?alert=errore&errorType=piano_non_trovato');
        }
        
        // Prepara il nome del file
        const fileName = `Piano_Alimentare_${piano.titolo.replace(/\s+/g, '_')}.txt`;
        
        // Imposta le intestazioni per il download
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'text/plain');
        
        // Prepara il contenuto
        let contenuto = `PIANO ALIMENTARE: ${piano.titolo}\n`;
        contenuto += `Data: ${piano.dataFormattata}\n`;
        contenuto += `Paziente: ${piano.nome} ${piano.cognome}\n\n`;
        contenuto += piano.contenuto;
        
        res.send(contenuto);
    } catch (error) {
        console.error('Errore durante il download del piano alimentare:', error);
        res.redirect('/utenteDashboard?alert=errore&errorType=errore_download');
    }
});

module.exports = router;
