'use strict';

// Middleware per verificare se un utente è autenticato
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Effettuare il login per accedere a questa pagina.');
  res.redirect('/auth/login');
};

// Middleware per verificare se l'utente è un admin
exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Effettuare il login per accedere a questa pagina.');
    return res.redirect('/auth/login');
  }

  if (req.isAuthenticated() && req.user.ruolo === 'admin') {
    return next();
  }

  req.flash('error', 'Non hai i permessi necessari per accedere a questa pagina.');
  res.redirect('/error');
};

// Middleware per verificare se l'utente è un paziente
exports.isPaziente = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Effettuare il login per accedere a questa pagina.');
    return res.redirect('/auth/login');
  }

  if (req.isAuthenticated() && req.user.ruolo === 'paziente') {
    return next();
  }

  req.flash('error', 'Non hai i permessi necessari per accedere a questa pagina.');
  res.redirect('/error');
};
