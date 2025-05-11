'use strict'

const db = require("../db");

// Inserisce una nuova richiesta di contatto
exports.inserisciRichiestaContatto = async (nome, email, messaggio) => {
    const sql = `INSERT INTO richieste_contatto (nome, email, messaggio)
                VALUES (?, ?, ?)`;
    const params = [nome, email, messaggio];
    
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
