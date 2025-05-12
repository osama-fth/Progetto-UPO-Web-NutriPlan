'use strict';

// Middleware per verificare se un utente è autenticato
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/error?message=Devi%20effettuare%20l%27accesso%20per%20visualizzare%20questa%20pagina');
};

// Middleware per verificare se l'utente è un admin
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.ruolo === 'admin') {
    return next();
  }
  if (!req.isAuthenticated()) {
    return res.redirect('/error?message=Devi%20effettuare%20l%27accesso%20per%20visualizzare%20questa%20pagina');
  }
  res.redirect('/error?message=Non%20sei%20autorizzato%20ad%20accedere%20a%20questa%20pagina');
};

// Middleware per verificare se l'utente è un paziente
exports.isPaziente = (req, res, next) => {
  if (req.isAuthenticated() && req.user.ruolo === 'paziente') {
    return next();
  }
  if (!req.isAuthenticated()) {
    return res.redirect('/error?message=Devi%20effettuare%20l%27accesso%20per%20visualizzare%20questa%20pagina');
  }
  res.redirect('/error?message=Non%20sei%20autorizzato%20ad%20accedere%20a%20questa%20pagina');
};
