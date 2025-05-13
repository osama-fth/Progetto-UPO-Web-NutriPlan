'use strict';

const db = require('../db');

// Funzione per inserire una nuova richiesta di contatto
exports.inserisciRichiestaContatto = function(nome, email, messaggio) {
    const sql = 'INSERT INTO richieste_contatto (nome, email, messaggio, data_creazione) VALUES (?, ?, ?, datetime("now"))';
    
    return new Promise((resolve, reject) => {
        db.run(sql, [nome, email, messaggio], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

// Funzione per ottenere tutte le richieste di contatto
exports.getAllRichiesteContatto = function() {
    const sql = 'SELECT * FROM richieste_contatto ORDER BY data_creazione DESC';
    
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

// Funzione per ottenere una richiesta di contatto specifica
exports.getRichiestaContattoById = function(id) {
    const sql = 'SELECT * FROM richieste_contatto WHERE id = ?';
    
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

// Funzione per eliminare una richiesta di contatto
exports.deleteRichiestaContatto = function(id) {
    const sql = 'DELETE FROM richieste_contatto WHERE id = ?';
    
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
