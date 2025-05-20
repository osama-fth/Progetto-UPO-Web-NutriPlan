'use strict';

const db = require('../db');

class RecensioniDAO {
  constructor(database) {
    this.db = database;
  }

  async getAllRecensioni() {
    const sql = `
        SELECT r.*, u.nome
        FROM recensioni r
        JOIN utenti u ON r.utente_id = u.id
        ORDER BY r.data_creazione DESC
    `;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getAllRecensioniWithUserInfo() {
    const sql = `
        SELECT r.*, u.nome, u.cognome 
        FROM recensioni r
        JOIN utenti u ON r.utente_id = u.id
        ORDER BY r.data_creazione DESC
    `;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  // Nuovo metodo per cercare recensioni
  async searchRecensioni(keyword) {
    const sql = `
        SELECT r.*, u.nome, u.cognome 
        FROM recensioni r
        JOIN utenti u ON r.utente_id = u.id
        WHERE r.commento LIKE ? OR u.nome LIKE ? OR u.cognome LIKE ?
        ORDER BY r.data_creazione DESC
    `;
    const searchParam = `%${keyword}%`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [searchParam, searchParam, searchParam], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getRecensioneById(id) {
    const sql = 'SELECT * FROM recensioni WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getRecensioneByUserId(id_utente) {
    const sql = 'SELECT * FROM recensioni WHERE utente_id = ?';
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id_utente], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Aggiornato per includere la valutazione
  async insertRecensione(id_utente, commento, valutazione) {
    const sql = 'INSERT INTO recensioni (utente_id, commento, valutazione, data_creazione) VALUES (?, ?, ?, datetime("now"))';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id_utente, commento, valutazione], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  // Aggiornato per includere la valutazione
  async updateRecensione(id, commento, valutazione) {
    const sql = 'UPDATE recensioni SET commento = ?, valutazione = ?, data_creazione = datetime("now") WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [commento, valutazione, id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  async deleteRecensione(id) {
    const sql = 'DELETE FROM recensioni WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }
}

module.exports = new RecensioniDAO(db);
