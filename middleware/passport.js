'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const utentiDao = require('../models/dao/utenti-dao');

// Configurazione della strategia di autenticazione locale
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        // Cerca l'utente nel database
        const utente = await utentiDao.getUser(email);

        if (!utente) {
          return done(null, false, { message: 'Utente non trovato.' });
        }

        // Verifica la password con bcrypt
        const isMatch = await bcrypt.compare(password, utente.password);

        if (isMatch) {
          return done(null, utente);
        } else {
          return done(null, false, { message: 'Password errata.' });
        }
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// Serializza l'utente per salvarlo nella sessione
passport.serializeUser((utente, done) => {
  done(null, utente.id);
});

// Deserializza l'utente dalla sessione
passport.deserializeUser(async (id, done) => {
  try {
    const user = await utentiDao.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
