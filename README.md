# 🥗 NutriPlan - Applicazione Web per Nutrizione

![Node.js](https://img.shields.io/badge/Node.js-14+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightgrey)
![EJS](https://img.shields.io/badge/EJS-Template%20Engine-orange)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![Chart.js](https://img.shields.io/badge/Chart.js-Graphs-red)

Un'applicazione web completa per la gestione e pianificazione dell'alimentazione, progettata per connettere nutrizionisti e pazienti attraverso un'interfaccia intuitiva e funzionale.

## 📝 Informazioni sul progetto

Questo progetto è stato sviluppato come elaborato per il corso di **Metodologie di Programmazione Web** dell'**Università del Piemonte Orientale**. L'obiettivo è dimostrare le competenze acquisite nella creazione di applicazioni web full-stack utilizzando tecnologie web moderne.

## ✨ Caratteristiche principali

### 👤 Per i pazienti:
- **🏠 Dashboard personalizzata** con navigazione intuitiva
- **📊 Monitoraggio del peso** con grafici interattivi e visualizzazione andamento temporale
- **📏 Gestione misurazioni** (aggiunta, modifica, eliminazione con conferma)
- **🍽️ Visualizzazione piani alimentari** dettagliati assegnati dal nutrizionista
- **📱 Interfaccia responsive** ottimizzata per dispositivi mobili e desktop
- **📄 Download PDF** dei piani alimentari personalizzati
- **⭐ Sistema di recensioni** per valutare il servizio (1-5 stelle con commenti)
- **👤 Gestione completa del profilo** (modifica dati personali e password)
- **🔐 Sicurezza avanzata** con validazione dati e protezione password

### 👨‍⚕️ Per gli amministratori/nutrizionisti:
- **👥 Gestione completa dei pazienti** con visualizzazione dettagliata
- **📋 Creazione piani alimentari** con editor strutturato per 7 giorni/3 pasti
- **📈 Monitoraggio progressi pazienti** con grafici peso integrati
- **📝 Gestione recensioni** con moderazione e controllo contenuti
- **📩 Sistema richieste di contatto** con gestione centralizzata
- **🗂️ Dashboard multi-sezione** per organizzazione efficiente
- **📊 Visualizzazione dati pazienti** con informazioni dettagliate
- **🔍 Ricerca e filtri** per gestione ottimizzata

### 🌐 Funzionalità pubbliche:
- **🏠 Homepage accattivante** con sezioni informative
- **📞 Form di contatto** per utenti non registrati
- **📖 Pagina recensioni** con sistema di ricerca
- **📱 Design completamente responsive**

## 🛠️ Tecnologie utilizzate

### Frontend:
- **HTML5** - Struttura semantica delle pagine
- **CSS3** - Styling avanzato con variabili CSS e animazioni
- **JavaScript ES6+** - Interattività lato client
- **Bootstrap 5.3** - Framework UI responsive
- **Chart.js** - Grafici interattivi per visualizzazione dati
- **Font Awesome** - Iconografia moderna

### Backend:
- **Node.js** - Runtime JavaScript server-side
- **Express.js** - Framework web veloce e minimalista
- **EJS** - Template engine per rendering dinamico
- **Express-validator** - Validazione robusta dei dati
- **PDFKit** - Generazione dinamica di documenti PDF

### Database & Autenticazione:
- **SQLite** - Database relazionale leggero
- **Passport.js** - Autenticazione strategica
- **bcrypt** - Hash sicuro delle password
- **Express-session** - Gestione sessioni utente

## 🚀 Installazione e configurazione

### Prerequisiti
- **Node.js** (v14.x o superiore)
- **npm** (v6.x o superiore)
- **Git**

### Procedura di installazione

```bash
# Clona il repository
git clone https://github.com/osama-fth/NutriPlan.git

# Naviga nella directory del progetto
cd NutriPlan

# Installa le dipendenze
npm install
```

### Configurazione iniziale

Il database SQLite viene inizializzato automaticamente al primo avvio. La struttura include:
- Tabella `utenti` con gestione ruoli
- Tabella `misurazioni` per tracking peso
- Tabella `piani_alimentari` con contenuto JSON
- Tabella `recensioni` con sistema valutazioni
- Tabella `richieste_contatto` per gestione comunicazioni

### Avvio dell'applicazione

```bash
# Avvia in modalità sviluppo (con hot-reload)
npm run dev

# Avvio standard per produzione
npm start
```

L'applicazione sarà disponibile su `http://localhost:3000`

### Account di test

**Amministratore:**
- Email: `admin@gmail.com`
- Password: `admin1234`

**Paziente di esempio:**
- Email: `mario@gmail.com`
- Password: `mario1234`

## 📂 Struttura del progetto

```
NutriPlan/
├── 📁 models/                        # Layer dati e business logic
│   ├── 📁 dao/                      # Data Access Objects
│   │   ├── utenti-dao.js             # Gestione utenti e autenticazione
│   │   ├── misurazioni-dao.js        # Operazioni misurazioni peso
│   │   ├── piani-alimentari-dao.js   # Gestione piani nutrizionali
│   │   ├── recensioni-dao.js         # Sistema recensioni
│   │   └── contatti-dao.js           # Richieste di contatto
│   ├── db.js                         # Configurazione database SQLite
│   ├── passport.js                   # Strategia autenticazione
│   └── pdf-generator.js              # Generazione PDF piani alimentari
├── 📁 middleware/                    # Middleware Express personalizzati
│   └── permessi.js                   # Controllo autorizzazioni e ruoli
├── 📁 public/                        # Asset statici
│   ├── 📁 images/                    # Immagini e logo
│   ├── 📁 javascripts/               # Script client-side
│   │   ├── admin-dashboard.js        # Logica dashboard admin
│   │   ├── user-dashboard.js         # Logica dashboard utente
│   │   ├── grafico-peso.js           # Gestione grafici Chart.js
│   │   └── conferma-eliminazione.js  # Modal conferme
│   └── 📁 stylesheets/               # Fogli di stile CSS
│       └── style.css                 # Stili personalizzati
├── 📁 routes/                        # Gestori delle rotte
│   ├── index.js                      # Rotte pubbliche (home, contatti)
│   ├── auth.js                       # Autenticazione (login, registro)
│   ├── user.js                       # Dashboard e funzionalità utente
│   └── admin.js                      # Pannello amministrativo
├── 📁 views/                         # Template EJS
│   ├── 📁 pages/                     # Pagine complete
│   │   ├── home.ejs                  # Homepage pubblica
│   │   ├── login.ejs                 # Pagina di accesso
│   │   ├── register.ejs              # Registrazione utente
│   │   ├── utente-dashboard.ejs      # Dashboard paziente
│   │   ├── admin-dashboard.ejs       # Dashboard amministratore
│   │   └── recensioni.ejs            # Pagina recensioni pubblica
│   └── 📁 partials/                  # Componenti riutilizzabili
│       ├── header.ejs                # Meta tag e CSS
│       ├── navbar.ejs                # Barra di navigazione
│       ├── footer.ejs                # Footer responsive
│       ├── alerts.ejs                # Sistema notifiche flash
│       └── 📁 modals/                # Modal Bootstrap
├── 📄 server.js                      # Entry point applicazione
├── 📄 package.json                   # Configurazione npm e dipendenze
└── 📄 Nutriplan.db                   # Database SQLite 
```

## 💻 Funzionalità dettagliate

### 🔐 Sistema di autenticazione avanzato
- **Registrazione sicura** con validazione email e password
- **Login persistente** con gestione sessioni
- **Hash password** con bcrypt per sicurezza
- **Controllo ruoli** (paziente/amministratore)
- **Middleware protezione** rotte sensibili
- **Logout sicuro** con pulizia sessione

### 📊 Dashboard paziente completa
- **Grafici peso interattivi** con Chart.js e andamento temporale
- **Gestione misurazioni CRUD** (Create, Read, Update, Delete)
- **Visualizzazione piani alimentari** con layout strutturato per giorni/pasti
- **Download PDF personalizzati** dei piani nutrizionali
- **Sistema recensioni** con valutazione a stelle (1-5)
- **Gestione profilo** con aggiornamento dati e password
- **Interfaccia responsive** ottimizzata per mobile

### ⚙️ Dashboard amministratore professionale
- **Gestione pazienti** con visualizzazione dati completi e grafici peso
- **Editor piani alimentari** strutturato per 7 giorni e 3 pasti giornalieri
- **Monitoraggio recensioni** con possibilità di moderazione
- **Gestione richieste contatto** centralizzata
- **Interfaccia multi-tab** per organizzazione efficiente
- **Operazioni CRUD** complete su tutte le entità

## 👨‍💻 Autore

**Osama Foutih** - Studente di Informatica presso l'Università del Piemonte Orientale

---

*Progetto sviluppato nell'ambito del corso di Metodologie di Programmazione Web - A.A. 2024/2025*
