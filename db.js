'use strict';

const sqlite = require('sqlite3');
const DB_NAME = process.env.DB_NAME;

const db = new sqlite.Database('./' + DB_NAME, sqlite.OPEN_READWRITE, (err) => {
  if (err) {
    console.log('Errore nella connessione: ', err.message);
  } else {
    console.log('Connessione al database avvenuta con successo...');
  }
});

module.exports = db;
