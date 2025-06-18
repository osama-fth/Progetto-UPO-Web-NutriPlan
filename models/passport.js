"use strict";

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const utentiDao = require('./dao/utenti-dao');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const utente = await utentiDao.getUser(email);

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

passport.deserializeUser(async (id, done) => {
  try {
    const user = await utentiDao.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
