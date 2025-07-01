"use strict";

const express = require("express");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
const methodOverride = require('method-override');
const flash = require('express-flash');

// Importazione delle rotte
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const PORT = process.env.PORT;
const app = express();

// Configurazione middleware di base
app.use(morgan("dev"));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Configurazione per ambiente di produzione
const isProduction = process.env.NODE_ENV === "production";
app.set('trust proxy', 1);

// Configurazione sessioni
app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000 // 1 ora
  }
}));

// Configurazione del motore di template
app.set("view engine", "ejs");

// Configurazione middleware flash e Passport
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// Configurazione delle rotte
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT} (http://localhost:${PORT})`);
});
