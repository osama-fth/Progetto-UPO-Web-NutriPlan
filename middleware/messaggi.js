"use strict";

module.exports = (req, res, next) => {
  if (!req.session.messaggi) {
    req.session.messaggi = {};
  }

  req.flash = function(type, message) {
    if (!req.session.messaggi) {
      req.session.messaggi = {};
    }
    
    if (message === undefined) {
      const msg = req.session.messaggi[type] || '';
      delete req.session.messaggi[type];
      return msg;
    }
    
    req.session.messaggi[type] = message;
    return req;
  };

  res.locals.success = req.flash('success') || '';
  res.locals.error = req.flash('error') || '';

  next();
};
