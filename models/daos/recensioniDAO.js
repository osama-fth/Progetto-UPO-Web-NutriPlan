'use strict'

const db = require("../db");

// Recupera tutte le recensioni
exports.getAllRecensioni = async () => {
    const sql = `SELECT r.id, r.utente_id, r.commento, r.data_creazione,
                       u.nome, u.cognome
                FROM recensioni r
                JOIN utenti u ON r.utente_id = u.id
                ORDER BY r.data_creazione DESC`;
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Recupera una recensione specifica
exports.getRecensioneById = async (recensioneId) => {
    const sql = `SELECT id, utente_id, commento, data_creazione
                FROM recensioni
                WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
        db.get(sql, [recensioneId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
};

// Recupera la recensione di un utente
exports.getRecensioneByUserId = async (utenteId) => {
    const sql = `SELECT id, utente_id, commento, data_creazione
                FROM recensioni
                WHERE utente_id = ?`;
    
    return new Promise((resolve, reject) => {
        db.get(sql, [utenteId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
};

// Inserisce una nuova recensione
exports.insertRecensione = async (utenteId, commento) => {
    const dataCreazione = new Date().toISOString().split('T')[0];
    const sql = `INSERT INTO recensioni (utente_id, commento, data_creazione)
                VALUES (?, ?, ?)`;
    const params = [utenteId, commento, dataCreazione];
    
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID });
            }
        });
    });
};

// Aggiorna una recensione esistente
exports.updateRecensione = async (recensioneId, commento) => {
    const sql = `UPDATE recensioni
                SET commento = ?
                WHERE id = ?`;
    const params = [commento, recensioneId];
    
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Elimina una recensione
exports.deleteRecensione = async (recensioneId) => {
    const sql = `DELETE FROM recensioni WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [recensioneId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};
