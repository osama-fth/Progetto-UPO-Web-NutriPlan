// Middleware per verificare se un utente è autenticato
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login?alert=errore&errorType=non_autorizzato');
};

// Middleware per verificare se l'utente è un admin
exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.ruolo === 'admin') {
        return next();
    }
    res.redirect('/login?alert=errore&errorType=non_autorizzato');
};
