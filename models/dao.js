'use strict'

const db = require("./db")

// Registrazione nuovo paziente
exports.newUser = async (user, cryptPwd) => {
    let sql = `INSERT INTO utenti (nome, cognome, email, password, data_di_nascita, ruolo) 
                VALUES (?, ?, ?, ?, ?, ?)`
    let params = [
        user.nome,
        user.cognome,
        user.email,
        cryptPwd,
        user.data_di_nascita,
        "paziente"
    ]

    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err){
            if (err) {
                reject(err)
            } else {
                resolve({id: this.lastID});
            }
        })
    })    
}

// Get di tutti i pazienti
exports.getAllPazienti = async () => {
    const sql = `SELECT id, nome, cognome, email, data_di_nascita
                 FROM utenti 
                 WHERE ruolo = 'paziente'
                 ORDER BY cognome, nome`;
    
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

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

//Recupera le misurazioni di un utente
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

/**
 * Recupera tutte le recensioni
 * @returns {Promise<Array>} Promise con array delle recensioni
 */
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

/**
 * Recupera una recensione specifica
 * @param {number} recensioneId - ID della recensione
 * @returns {Promise<Object|null>} Promise con la recensione
 */
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

/**
 * Recupera la recensione di un utente
 * @param {number} utenteId - ID dell'utente
 * @returns {Promise<Object|null>} Promise con la recensione
 */
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

/**
 * Inserisce una nuova recensione
 * @param {number} utenteId - ID dell'utente
 * @param {string} commento - Testo della recensione
 * @returns {Promise<Object>} Promise con l'ID della recensione inserita
 */
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

/**
 * Aggiorna una recensione esistente
 * @param {number} recensioneId - ID della recensione
 * @param {string} commento - Nuovo testo della recensione
 * @returns {Promise<void>}
 */
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

/**
 * Elimina una recensione
 * @param {number} recensioneId - ID della recensione
 * @returns {Promise<void>}
 */
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

/**
 * Elimina un account utente
 * @param {number} utenteId - ID dell'utente da eliminare
 * @returns {Promise<void>}
 */
exports.deleteAccount = async (utenteId) => {
    const sql = `DELETE FROM utenti WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
        db.run(sql, [utenteId], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * Aggiorna una misurazione
 * @param {number} misurazioneId - ID della misurazione da aggiornare
 * @param {number} peso - Nuovo peso in kg
 * @param {string} data - Nuova data della misurazione in formato YYYY-MM-DD
 * @returns {Promise<void>}
 */
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

/**
 * Elimina una misurazione
 * @param {number} misurazioneId - ID della misurazione da eliminare
 * @returns {Promise<void>}
 */
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

/**
 * Recupera una misurazione specifica tramite ID
 * @param {number} misurazioneId - ID della misurazione
 * @returns {Promise<Object|null>} Promise con la misurazione o null se non trovata
 */
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

/**
 * Inserisce una nuova richiesta di contatto
 * @param {string} nome - Nome dell'utente
 * @param {string} email - Email dell'utente
 * @param {string} messaggio - Testo del messaggio
 * @returns {Promise<Object>} Promise con l'ID della richiesta inserita
 */
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
