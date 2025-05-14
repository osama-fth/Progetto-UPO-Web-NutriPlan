"use strict"
const express = require("express")
const session = require("express-session")
const passport = require("passport")
const morgan = require("morgan")

const PORT = 3000
const app = express()

// Import delle route
const indexRouter = require("./routes/index");
const recensioniRouter = require("./routes/recensioni");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const misurazioniRouter = require("./routes/misurazioni");
const utenteDashboardRouter = require("./routes/utente_dashboard");
const adminDashboardRouter = require("./routes/admin_dashboard")
const logoutRouter = require("./routes/logout");
const accountRouter = require('./routes/account');
const contattiRouter = require('./routes/contatti');
const errorRouter = require('./routes/error')

// Configurazione del server
app.set("view engine", "ejs")

// Middleware
app.use(morgan("dev"))
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configurazione della sessione
app.use(session({
    secret: "chiave-super-segreta",
    resave: false,
    saveUninitialized: true
}))

// Configurazione di Passport per l'autenticazione
app.use(passport.initialize())
app.use(passport.session())

// Rotte
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/register", registerRouter);
app.use("/recensioni", recensioniRouter);
app.use("/utenteDashboard", utenteDashboardRouter);
app.use("/adminDashboard", adminDashboardRouter);
app.use('/account', accountRouter);
app.use("/misurazioni", misurazioniRouter);
app.use('/contatti', contattiRouter);
app.use("/error", errorRouter)

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
