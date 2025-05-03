"use strict"

const express = require("express")
const sqlite = require("sqlite3")
const morgan = require("morgan")
const PORT = 3000

const app = express()

app.use(morgan("tiny"))
app.use(express.static('public'))
app.use(express.json)

const db = new sqlite.Database('db/Nutriplan.db', (err) => {
    if (err) {
        console.log('Errore nella connessione: ', err.message);
    } else {
        console.log('Connesso al database');
    }
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});
