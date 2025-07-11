'use strict';

const db = require('../../db');

class RecensioniDAO {
  constructor(database) {
    this.db = database;
  }

  async getAllRecensioni() {
    const sql = `SELECT r.*, u.nome
                 FROM recensioni r
                 JOIN utenti u ON r.utente_id = u.id
                 ORDER BY r.data_creazione DESC`;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async filtraRecensioniPerValutazione(valutazione) {
    const sql = `SELECT r.*, u.nome
                 FROM recensioni r
                 JOIN utenti u ON r.utente_id = u.id
                 WHERE r.valutazione = ?
                 ORDER BY r.data_creazione DESC`;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [valutazione], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getRecensioneById(id) {
    const sql = 'SELECT * FROM recensioni WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getRecensioneByUserId(id_utente) {
    const sql = 'SELECT * FROM recensioni WHERE utente_id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [id_utente], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async insertRecensione(id_utente, commento, valutazione) {
    const sql =
      'INSERT INTO recensioni (utente_id, commento, valutazione, data_creazione) VALUES (?, ?, ?, datetime("now"))';

    return new Promise((resolve, reject) => {
      this.db.run(sql, [id_utente, commento, valutazione], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  async deleteRecensione(id) {
    const sql = 'DELETE FROM recensioni WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }
}

module.exports = new RecensioniDAO(db);
