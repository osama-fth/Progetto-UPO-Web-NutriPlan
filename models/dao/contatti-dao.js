'use strict';

const db = require('../db');

class ContattiDAO {
  constructor(database) {
    this.db = database;
  }

  async inserisciRichiestaContatto(nome, email, messaggio) {
    const sql = 'INSERT INTO richieste_contatto (nome, email, messaggio, data_creazione) VALUES (?, ?, ?, datetime("now"))';

    return new Promise((resolve, reject) => {
      this.db.run(sql, [nome, email, messaggio], (err) => {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async getAllRichiesteContatto() {
    const sql = 'SELECT * FROM richieste_contatto ORDER BY data_creazione DESC';

    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getRichiestaContattoById(id) {
    const sql = 'SELECT * FROM richieste_contatto WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async deleteRichiestaContatto(id) {
    const sql = 'DELETE FROM richieste_contatto WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new ContattiDAO(db);
