'use strict'
const express = require("express")
const router = express.Router()
const { check, validationResult} = require("express-validator")
const bcrypt = require("bcrypt")
const dao = require("../models/dao")

router.get("/", (req, res) => {
    res.render("pages/register", { 
        title: 'NutriPlan - Registrazione',
        user: req.user 
    });
})

router.post("/", [
    check('nome').notEmpty().withMessage("Il nome è obbligatorio").matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il nome deve contenere solo lettere'),
    check('cognome').notEmpty().withMessage("Il cognome è obbligatorio").matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/).withMessage('Il cognome deve contenere solo lettere'),
    check('email').isEmail().withMessage('Inserisci un indirizzo email valido').notEmpty().withMessage('L\'email è obbligatoria'),
    check('password').isLength({ min: 8 }).withMessage('La password deve essere lunga almeno 8 caratteri'),
    check('data_di_nascita').isDate().withMessage('Inserisci una data di nascita valida'),
    check('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Le password non coincidono');
            }
            return true;
        }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Errori di validazione:", errors.array());
        return res.render("pages/register", { 
            user: req.user,
            errors: errors.array(),
            formData: req.body 
        });
    }

    try {
        const cryptoPwd = await bcrypt.hash(req.body.password, 10);
        await dao.newUser(
            req.body, 
            cryptoPwd
        );
        req.session.success = 'Registrazione completata con successo.';
        return res.redirect("/login");
    } catch (error) {
        console.log("Errore durante la registrazione: ", error);
        res.render("pages/register?alert=errore&errorType=registrazioneFallita", { 
            user: req.user,
            error: "Errore durante la registrazione. Potrebbe essere che l'email sia già in uso.",
            formData: req.body
        });
    }
});

module.exports = router
