"use strict";

const express = require("express");
const dotenv = require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
const flash = require('express-flash');
const flashMessages = require('./middleware/messaggi');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

const PORT = process.env.PORT;
const app = express();

app.use(morgan("dev"));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',   
    maxAge: 60 * 60 * 1000
  }
}));

app.use(flash());
app.use(flashMessages);
app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});
