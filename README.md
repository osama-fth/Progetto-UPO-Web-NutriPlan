# NutriPlan - Applicazione Web per Nutrizione

Un'applicazione web per la gestione dell'alimentazione che connette nutrizionisti e pazienti.

## Informazioni sul progetto

Progetto sviluppato per il corso di **Metodologie di Programmazione Web** dell'**Università del Piemonte Orientale**.

## Funzionalità principali

### Per i pazienti:
- Dashboard personalizzata
- Monitoraggio del peso con grafici
- Visualizzazione piani alimentari
- Download PDF dei piani
- Sistema di recensioni
- Gestione profilo

### Per gli amministratori:
- Gestione pazienti
- Creazione piani alimentari
- Monitoraggio progressi
- Gestione recensioni e contatti

## Tecnologie utilizzate

- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Template Engine:** EJS
- **Altri:** Chart.js, PDFKit, Passport.js

## Installazione

```bash
# Clona il repository
git clone https://github.com/osama-fth/Progetto-UPO-Web-NutriPlan.git

# Naviga nella directory
cd NutriPlan

# Crea manualmente un file .env con le seguenti variabili:
NODE_ENV="development"
DB_NAME="Nutriplan.db"
PORT=3000
SECRET_SESSION="your-secret-session-key-here"

# Installa le dipendenze
npm install

# Avvia l'applicazione
npm start

# Avvia l'applicazione in modalità sviluppo
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## Account di test

**Amministratore:**
- Email: `admin@gmail.com`
- Password: `admin1234`

**Paziente:**
- Email: `mario@gmail.com`
- Password: `mario1234`

## Autore

**Osama Foutih** - Università del Piemonte Orientale

---

_Progetto per il corso di Metodologie di Programmazione Web - A.A. 2024/2025_
