"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./db');


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async function (email, password, done) {
    try {
        const utente = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM utenti WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!utente) {
            return done(null, false, { message: 'Utente non trovato.' });
        }

        const isMatch = await bcrypt.compare(password, utente.password);

        if (isMatch) {
            return done(null, utente);
        } else {
            return done(null, false, { message: 'Password errata.' });
        }
    } catch (err) {
        return done(err);
    }
}));


passport.serializeUser((utente, done) => {
    done(null, utente.id);
});


passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM utenti WHERE id = ?', [id], (err, row) => {
        done(err, row);
    });
});


console.log("Passport configurato con successo");


module.exports = passport;
