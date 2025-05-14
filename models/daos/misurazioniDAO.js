'use strict'

const db = require("../db");

// Inserisce una nuova misurazione per un utente
exports.insertMisurazione = async (utenteId, peso, data) => {
    const sql = `INSERT INTO misurazioni (utente_id, misura, data)
                 VALUES (?, ?, ?)`;
    const params = [utenteId, peso, data];
    
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

// Recupera le misurazioni di un utente
exports.getMisurazioniByUserId = async (utenteId) => {
    const sql = `SELECT id, misura, data
                 FROM misurazioni
                 WHERE utente_id = ?
                 ORDER BY data`;
    const params = [utenteId];
    
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Recupera una misurazione specifica tramite ID
exports.getMisurazioneById = async (misurazioneId) => {
    const sql = `SELECT id, utente_id, misura, data
                 FROM misurazioni
                 WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
        db.get(sql, [misurazioneId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
};

// Aggiorna una misurazione
exports.updateMisurazione = async (misurazioneId, peso, data) => {
    const sql = `UPDATE misurazioni 
                 SET misura = ?, data = ? 
                 WHERE id = ?`;
    const params = [peso, data, misurazioneId];
    
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

// Elimina una misurazione
exports.deleteMisurazione = async (misurazioneId) => {
    const sql = `DELETE FROM misurazioni WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [misurazioneId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Recupera tutte le misurazioni di un utente specifico
exports.getMisurazioniByUtente = async (utenteId) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT * FROM misurazioni
            WHERE utente_id = ?
            ORDER BY data DESC`;
        
        db.all(sql, [utenteId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};
