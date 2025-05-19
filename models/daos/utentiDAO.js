'use strict';

const db = require("../db");

class UtentiDAO {
  constructor(database) {
    this.db = database;
  }

  async newUser(user, cryptPwd) {
    let sql = `INSERT INTO utenti (nome, cognome, email, password, data_di_nascita, ruolo) 
                VALUES (?, ?, ?, ?, ?, ?)`;
    let params = [
      user.nome,
      user.cognome,
      user.email,
      cryptPwd,
      user.data_di_nascita,
      "paziente"
    ];
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({id: this.lastID});
      });
    });
  }

  async getAllPazienti() {
    const sql = `SELECT id, nome, cognome, email, data_di_nascita
                 FROM utenti 
                 WHERE ruolo = 'paziente'
                 ORDER BY cognome, nome`;
                 
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async deleteAccount(utenteId) {
    const sql = `DELETE FROM utenti WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [utenteId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new UtentiDAO(db);
