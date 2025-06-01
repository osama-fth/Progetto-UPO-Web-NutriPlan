"use strict";

const db = require("../db");

class MisurazioniDAO {
  constructor(database) {
    this.db = database;
  }

  async insertMisurazione(utenteId, peso, data) {
    const sql = `INSERT INTO misurazioni (utente_id, misura, data) VALUES (?, ?, ?)`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [utenteId, peso, data], (err) => {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  async getMisurazioniByUserId(utenteId) {
    const sql = `SELECT id, misura, data
                 FROM misurazioni
                 WHERE utente_id = ?
                 ORDER BY data`;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [utenteId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getMisurazioneById(misurazioneId) {
    const sql = `SELECT id, utente_id, misura, data
                 FROM misurazioni
                 WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.db.get(sql, [misurazioneId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateMisurazione(misurazioneId, peso, data) {
    const sql = `UPDATE misurazioni 
                 SET misura = ?, data = ? 
                 WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [peso, data, misurazioneId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deleteMisurazione(misurazioneId) {
    const sql = `DELETE FROM misurazioni WHERE id = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [misurazioneId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new MisurazioniDAO(db);
