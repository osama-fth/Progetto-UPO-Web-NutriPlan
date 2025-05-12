'use strict';

// Middleware per verificare se un utente è autenticato
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/error?message=EffettuareLogin');
};

// Middleware per verificare se l'utente è un admin
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.ruolo === 'admin') {
    return next();
  }
  if (!req.isAuthenticated()) {
    return res.redirect('/error?message=EffettuareLogin');
  }
  res.redirect('/error?message=AutorizzazioneNegata');
};

// Middleware per verificare se l'utente è un paziente
exports.isPaziente = (req, res, next) => {
  if (req.isAuthenticated() && req.user.ruolo === 'paziente') {
    return next();
  }
  if (!req.isAuthenticated()) {
    return res.redirect('/error?message=EffettuareLogin');
  }
  res.redirect('/error?message=AutorizzazioneNegata');
};
