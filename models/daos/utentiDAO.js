'use strict';

const db = require("../db");

class UtentiDAO {
  constructor(database) {
    this.db = database;
  }

  async getUser(email){
    let sql = `SELECT * FROM utenti WHERE email = ?`

    return new Promise((resolve, reject) =>{
      this.db.get(sql, [email], function(err, row){
        if(err) reject(err)
        else resolve(row)
      })
    })
  }

  async getUserById(id){
    let sql = `SELECT * FROM utenti WHERE id = ?`

    return new Promise((resolve, reject) =>{
      this.db.get(sql, [id], function(err, row){
        if(err) reject(err)
        else resolve(row)
      })
    })
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
    const params = [newPassword, userId];
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = new UtentiDAO(db);
