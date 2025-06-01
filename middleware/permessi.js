'use strict';

exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Effettuare il login per accedere a questa pagina.');
    return res.redirect('/auth/login');
  }

  if (req.user.ruolo === 'admin') {
    return next();
  }

  req.flash('error', 'Non hai i permessi necessari per accedere a questa pagina.');
  res.redirect('/error');
};

exports.isPaziente = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'Effettuare il login per accedere a questa pagina.');
    return res.redirect('/auth/login');
  }

  if (req.user.ruolo === 'paziente') {
    return next();
  }

  req.flash('error', 'Non hai i permessi necessari per accedere a questa pagina.');
  res.redirect('/error');
};
