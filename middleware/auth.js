'use strict';

// Middleware per verificare se un utente è autenticato
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.error = 'Effettuare il login per accedere a questa pagina.';
  res.redirect('/login');
};

// Middleware per verificare se l'utente è un admin
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.ruolo === 'admin') {
    return next();
  }
  if (!req.isAuthenticated()) {
    req.session.error = 'Effettuare il login per accedere a questa pagina.';
    return res.redirect('/login');
  }
  req.session.error = 'Non hai i permessi necessari per accedere a questa pagina.';
  res.redirect('/error');
};

// Middleware per verificare se l'utente è un paziente
exports.isPaziente = (req, res, next) => {
  if (req.isAuthenticated() && req.user.ruolo === 'paziente') {
    return next();
  }
  if (!req.isAuthenticated()) {
    req.session.error = 'Effettuare il login per accedere a questa pagina.';
    return res.redirect('/login');
  }
  req.session.error = 'Non hai i permessi necessari per accedere a questa pagina.';
  res.redirect('/error');
};
