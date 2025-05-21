'use strict';
const sqlite = require('sqlite3');
const NOME_DB = "Nutriplan.db";

const db = new sqlite.Database('./' + NOME_DB, (err) => {
  if (err) {
    console.log('Errore nella connessione: ', err.message);
  } else {
    console.log('Connesso al database ' + NOME_DB);
  }
});

module.exports = db;
