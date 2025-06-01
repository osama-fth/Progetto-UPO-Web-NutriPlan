'use strict';

const db = require("../db");

class UtentiDAO {
  constructor(database) {
    this.db = database;
  }

  async getUser(email) {
    const sql = `SELECT * FROM utenti WHERE email = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getUserById(id) {
    const sql = `SELECT * FROM utenti WHERE id = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async newUser(user, HashedPassword) {
    const sql = `INSERT INTO utenti (nome, cognome, email, password, data_di_nascita, ruolo) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [user.nome, user.cognome, user.email, HashedPassword, user.data_di_nascita, "paziente"];
    
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

  async updateUserData(userId, nome, cognome, data_di_nascita) {
    const sql = `UPDATE utenti 
                 SET nome = ?, cognome = ?, data_di_nascita = ?
                 WHERE id = ?`;
    const params = [nome, cognome, data_di_nascita, userId];
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  async updatePassword(userId, newPassword) {
    const sql = `UPDATE utenti 
                 SET password = ?
                 WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [newPassword, userId], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = new UtentiDAO(db);
