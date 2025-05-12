'use strict'

const db = require("../db");

// Recupera tutti i piani alimentari di un utente
exports.getPianiAlimentariByUserId = async (utenteId) => {
    const sql = `SELECT id, titolo, contenuto, data_creazione
                FROM piano_alimentare
                WHERE utente_id = ?
                ORDER BY data_creazione DESC`;

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

// Recupera un piano alimentare specifico tramite ID
exports.getPianoAlimentareById = async (pianoId) => {
    const sql = `SELECT id, utente_id, titolo, contenuto, data_creazione
                FROM piano_alimentare
                WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.get(sql, [pianoId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    const data = new Date(row.data_creazione);
                    row.dataFormattata = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
                }
                resolve(row || null);
            }
        });
    });
};

// Scarica un piano alimentare (ottiene i dati completi)
exports.scaricaPianoAlimentare = async (pianoId, utenteId) => {
    const sql = `SELECT p.id, p.titolo, p.contenuto, p.data_creazione,
                       u.nome, u.cognome
                FROM piani_alimentari p
                JOIN utenti u ON p.utente_id = u.id
                WHERE p.id = ? AND p.utente_id = ?`;

    return new Promise((resolve, reject) => {
        db.get(sql, [pianoId, utenteId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
};
