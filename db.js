'use strict';

const sqlite = require('sqlite3');
const DB_NAME = process.env.DB_NAME;

const db = new sqlite.Database('./' + DB_NAME, (err) => {
  if (err) {
    console.log('Errore nella connessione: ', err.message);
  } else {
    console.log('Connesso al database ' + DB_NAME);
  }
});

module.exports = db;
