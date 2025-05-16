"use strict"
const express = require("express")
const session = require("express-session")
const passport = require("passport")
const morgan = require("morgan")

const PORT = 3000
const app = express()

// Importazione delle route
const siteRouter = require('./routes/site');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');


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

// Utilizzo delle route
app.use('/', siteRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
