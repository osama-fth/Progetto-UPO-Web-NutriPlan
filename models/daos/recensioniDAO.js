'use strict';

const db = require('../db');

// Funzione per ottenere tutte le recensioni
exports.getAllRecensioni = async function() {
    const sql = `
        SELECT r.*, u.nome
        FROM recensioni r
        JOIN utenti u ON r.utente_id = u.id
        ORDER BY r.data_creazione DESC
    `;
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            
            
            resolve(rows);
        });
    });
};

// Funzione per ottenere tutte le recensioni con informazioni utente complete
exports.getAllRecensioniWithUserInfo = async function() {
    const sql = `
        SELECT r.*, u.nome, u.cognome 
        FROM recensioni r
        JOIN utenti u ON r.utente_id = u.id
        ORDER BY r.data_creazione DESC
    `;
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            
            
            resolve(rows);
        });
    });
};

// Funzione per ottenere una recensione specifica
exports.getRecensioneById = function(id) {
    const sql = 'SELECT * FROM recensioni WHERE id = ?';
    
    return new Promise((resolve, reject) => {
        db.get(sql, [id], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            
            
            resolve(row);
        });
    });
};

// Funzione per ottenere la recensione di un utente
exports.getRecensioneByUserId = function(id_utente) {
    const sql = 'SELECT * FROM recensioni WHERE utente_id = ?';
    
    return new Promise((resolve, reject) => {
        db.get(sql, [id_utente], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            
            
            resolve(row);
        });
    });
};

// Funzione per inserire una recensione
exports.insertRecensione = function(id_utente, commento) {
    const sql = 'INSERT INTO recensioni (utente_id, commento, data_creazione) VALUES (?, ?, datetime("now"))';
    
    return new Promise((resolve, reject) => {
        db.run(sql, [id_utente, commento], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// Funzione per aggiornare una recensione
exports.updateRecensione = function(id, commento) {
    const sql = 'UPDATE recensioni SET commento = ?, data_creazione = datetime("now") WHERE id = ?';
    
    return new Promise((resolve, reject) => {
        db.run(sql, [commento, id], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};

// Funzione per eliminare una recensione
exports.deleteRecensione = function(id) {
    const sql = 'DELETE FROM recensioni WHERE id = ?';
    
    return new Promise((resolve, reject) => {
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.changes);
        });
    });
};
