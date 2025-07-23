# 🍃 NutriPlan - Applicazione Web per Nutrizione

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue?style=flat-square&logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.x-lightblue?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.x-purple?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)

Un'applicazione web moderna per la gestione dell'alimentazione che connette nutrizionisti e pazienti attraverso una piattaforma digitale intuitiva e completa.

</div>

## 📖 Informazioni sul progetto

Progetto sviluppato per il corso di **Metodologie di Programmazione Web** dell'**Università del Piemonte Orientale**.

## 🎯 Obiettivi del progetto

- Creare una piattaforma digitale per la gestione nutrizionale
- Implementare un sistema di monitoraggio progressi personalizzato
- Sviluppare un'interfaccia user-friendly per pazienti e nutrizionisti
- Garantire la sicurezza e privacy dei dati sanitari

## ✨ Funzionalità principali

### 👨‍⚕️ Per gli amministratori/nutrizionisti:
- 📊 **Dashboard completa** con panoramica pazienti
- 👥 **Gestione pazienti** (creazione, modifica, eliminazione account)
- 🍽️ **Creazione piani alimentari** personalizzati e dettagliati
- 📈 **Monitoraggio progressi** con grafici e statistiche
- ⭐ **Gestione recensioni** e feedback dei pazienti
- 📧 **Gestione richieste contatto** dal sito web
- 📋 **Export PDF** dei piani alimentari

### 👤 Per i pazienti:
- 🏠 **Dashboard personalizzata** con panoramica del proprio percorso
- ⚖️ **Monitoraggio del peso** con grafici interattivi e cronologia
- 🍎 **Visualizzazione piani alimentari** assegnati dal nutrizionista
- 📄 **Download PDF** dei propri piani nutrizionali
- ⭐ **Sistema di recensioni** per valutare il servizio
- ⚙️ **Gestione profilo** personale e impostazioni account
- 📊 **Tracciamento misurazioni** con visualizzazione temporale

## 🛠️ Tecnologie utilizzate

### Frontend
- **HTML5** - Struttura delle pagine
- **CSS3** - Stili e layout responsivo
- **JavaScript (ES6+)** - Interattività lato client
- **Bootstrap 5** - Framework CSS per UI responsive
- **Chart.js** - Grafici interattivi per monitoraggio peso

### Backend
- **Node.js** - Runtime JavaScript server-side
- **Express.js** - Framework web per Node.js
- **EJS** - Template engine per rendering dinamico
- **Passport.js** - Autenticazione e gestione sessioni
- **Bcrypt** - Hashing delle password

### Database & Storage
- **SQLite** - Database relazionale leggero
- **PDFKit** - Generazione documenti PDF

### Sviluppo & Deployment
- **Nodemon** - Auto-reload durante sviluppo
- **dotenv** - Gestione variabili d'ambiente

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js** (versione 14 o superiore) - [Download](https://nodejs.org/)
- **npm** (incluso con Node.js)
- **Git** (opzionale, per clonare il repository)

## 🚀 Installazione

### 1. Clonazione del repository

```bash
# Clona il repository
git clone https://github.com/osama-fth/Progetto-UPO-Web-NutriPlan.git

# Naviga nella directory del progetto
cd NutriPlan
```

### 2. Installazione dipendenze

```bash
# Installa tutte le dipendenze
npm install
```

### 3. Configurazione ambiente

```bash
# Copia il file di configurazione esempio
cp .env.example .env

# Modifica il file .env con i tuoi valori (opzionale per sviluppo)
# nano .env
```

### 4. Inizializzazione database

Il database SQLite verrà creato automaticamente al primo avvio dell'applicazione utilizzando lo schema definito in [`schema.sql`](schema.sql).

## ⚙️ Configurazione

Il file `.env` contiene le seguenti variabili configurabili:

| Variabile | Descrizione | Valore di default |
|-----------|-------------|-------------------|
| `NODE_ENV` | Ambiente di esecuzione | `development` |
| `DB_NAME` | Nome del file database SQLite | `Nutriplan.db` |
| `PORT` | Porta su cui avviare il server | `3000` |
| `SECRET_SESSION` | Chiave segreta per le sessioni | `your-secret-session-key-here` |

> ⚠️ **Importante:** In produzione, modifica sempre `SECRET_SESSION` con una chiave sicura e unica.

## 🏃‍♂️ Avvio dell'applicazione

### Modalità sviluppo (consigliata)
```bash
npm run dev
```

### Modalità produzione
```bash
npm start
```

L'applicazione sarà disponibile su: **http://localhost:3000**

## 👨‍💻 Account di test

Per testare l'applicazione, utilizza questi account preconfigurati:

### 🔑 Amministratore/Nutrizionista
- **Email:** `admin@gmail.com`
- **Password:** `admin1234`
- **Accesso:** Dashboard amministrativa completa

### 👤 Paziente
- **Email:** `mario@gmail.com`
- **Password:** `mario1234`
- **Accesso:** Dashboard paziente con dati di esempio

## 📁 Struttura del progetto

```
NutriPlan/
├── 📁 models/
│   ├── 📁 dao/              # Data Access Objects
│   │   ├── utenti-dao.js
│   │   ├── recensioni-dao.js
│   │   └── ...
│   └── 📁 pdf-generator/    # Generazione PDF
├── 📁 routes/               # Gestione delle rotte
│   ├── admin.js
│   ├── user.js
│   └── index.js
├── 📁 views/                # Template EJS
│   ├── 📁 pages/
│   └── 📁 partials/
├── 📁 public/               # File statici
│   ├── 📁 stylesheets/
│   ├── 📁 javascripts/
│   └── 📁 images/
├── 📁 middleware/           # Middleware personalizzati
├── 📄 db.js                # Configurazione database
├── 📄 app.js               # File principale applicazione
├── 📄 schema.sql           # Schema database
├── 📄 package.json         # Dipendenze e script
└── 📄 .env.example         # Template configurazione
```

## 🔒 Sicurezza

- **Autenticazione:** Sistema basato su Passport.js con sessioni
- **Validazione input:** Controlli server-side con express-validator
- **Protezione rotte:** Middleware per controllo autorizzazioni
- **Password:** Hash delle password utente (implementato tramite Bcrypt)
- **Sessioni:** Gestione sicura delle sessioni utente

## 📊 Database Schema

Il database SQLite include le seguenti tabelle principali:

- **utenti** - Informazioni utenti (admin/pazienti)
- **piano_alimentare** - Piani nutrizionali personalizzati
- **misurazioni** - Cronologia peso dei pazienti
- **recensioni** - Feedback e valutazioni dei pazienti
- **richieste_contatto** - Messaggi dal modulo contatti

Vedi [`schema.sql`](schema.sql) per i dettagli completi.

## 👨‍🎓 Autore

**Osama Foutih**  

---

<div align="center">

**📚 Progetto per il corso di Metodologie di Programmazione Web - A.A. 2024/2025**

</div>
