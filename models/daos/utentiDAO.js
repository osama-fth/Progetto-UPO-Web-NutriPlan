'use strict'

const db = require("../db");

exports.newUser = async (user, cryptPwd) => {
    let sql = `INSERT INTO utenti (nome, cognome, email, password, data_di_nascita, ruolo) 
                VALUES (?, ?, ?, ?, ?, ?)`;
    let params = [
        user.nome,
        user.cognome,
        user.email,
        cryptPwd,
        user.data_di_nascita,
        "paziente"
    ];
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err){
            if (err) reject(err);
            else resolve({id: this.lastID});
        });
    });
};

exports.getAllPazienti = async () => {
    const sql = `SELECT id, nome, cognome, email, data_di_nascita
                 FROM utenti 
                 WHERE ruolo = 'paziente'
                 ORDER BY cognome, nome`;
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.deleteAccount = async (utenteId) => {
    const sql = `DELETE FROM utenti WHERE id = ?`;
    return new Promise((resolve, reject) => {
        db.run(sql, [utenteId], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
};
