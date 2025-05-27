module.exports = (req, res, next) => {
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;

  // Cancella i messaggi dalla sessione dopo averli resi disponibili
  delete req.session.success;
  delete req.session.error;

  next();
};
