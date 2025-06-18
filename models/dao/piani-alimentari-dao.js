'use strict';

const db = require('../../db');

class PianiAlimentariDAO {
  constructor(database) {
    this.db = database;
  }

  async getPianiAlimentariByUserId(userId) {
    const sql = `SELECT id, utente_id, titolo, descrizione, contenuto, data_creazione
                 FROM piano_alimentare 
                 WHERE utente_id = ?
                 ORDER BY data_creazione DESC`;
                 
    return new Promise((resolve, reject) => {
      this.db.all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getPianoAlimentareById(pianoId) {
    const sql = `SELECT id, utente_id, titolo, descrizione, contenuto, data_creazione
                 FROM piano_alimentare 
                 WHERE id = ?`;
                 
    return new Promise((resolve, reject) => {
      this.db.get(sql, [pianoId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async insertPianoAlimentare(utenteId, titolo, descrizione, contenuto, dataCreazione) {
    const sql = `INSERT INTO piano_alimentare (utente_id, titolo, descrizione, contenuto, data_creazione) VALUES (?, ?, ?, ?, ?)`;
                 
    return new Promise((resolve, reject) => {
      this.db.run(sql, [utenteId, titolo, descrizione, contenuto, dataCreazione], (err) => {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async deletePianoAlimentare(pianoId) {
    const sql = `DELETE FROM piano_alimentare WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      this.db.run(sql, [pianoId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new PianiAlimentariDAO(db);

