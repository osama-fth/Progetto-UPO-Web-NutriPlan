# NutriPlan

NutriPlan è un'applicazione web completa per la gestione e pianificazione dell'alimentazione, rivolta sia a nutrizionisti che a pazienti. La piattaforma offre funzionalità di monitoraggio del peso, gestione di piani alimentari personalizzati e un sistema di feedback attraverso recensioni.

## Informazioni sul progetto

Questo progetto è stato sviluppato come elaborato per il corso di **Metodologie di Programmazione Web** dell'**Università del Piemonte Orientale**. L'obiettivo è dimostrare le competenze acquisite nella creazione di applicazioni web full-stack utilizzando tecnologie moderne.

## Caratteristiche principali

### Per i pazienti:
- **Dashboard personalizzata** con visualizzazione intuitiva dei dati
- **Monitoraggio del peso** con grafici interattivi
- **Visualizzazione piani alimentari** assegnati dal nutrizionista
- **Sistema di recensioni** per condividere la propria esperienza
- **Gestione del profilo personale**

### Per gli amministratori/nutrizionisti:
- **Gestione completa dei pazienti**
- **Creazione e assegnazione di piani alimentari**
- **Monitoraggio dei progressi dei pazienti**
- **Visualizzazione e gestione recensioni**
- **Gestione richieste di contatto**

## Tecnologie utilizzate

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Node.js, Express.js
- **Template Engine**: EJS
- **Database**: SQLite
- **Autenticazione**: Passport.js
- **Visualizzazione dati**: Chart.js

### Procedura di installazione

```bash
# Clona il repository
git clone https://github.com/osama-fth/NutriPlan.git

# Naviga nella directory del progetto
cd NutriPlan

# Installa le dipendenze
npm install
```

### Avvio del server di sviluppo

```bash
# Avvia l'applicazione in modalità sviluppo
npm run dev

# Oppure, per l'avvio standard
npm start
```

L'applicazione sarà disponibile all'indirizzo `http://localhost:3000`.

## Struttura del progetto

```
NutriPlan/
├── models/              # Modelli dati e accesso al database
│   ├── daos/           # Data Access Objects per le entità
│   ├── db.js           # Configurazione database SQLite
│   └── passport.js     # Configurazione autenticazione
├── middleware/         # Middleware Express
│   └── auth.js         # Middleware autenticazione
├── public/             # File statici
│   ├── images/         # Immagini
│   ├── javascripts/    # File JavaScript client-side
│   └── stylesheets/    # File CSS
├── routes/             # Gestori delle rotte
├── views/              # Template EJS
│   ├── pages/          # Pagine principali
│   └── partials/       # Componenti riutilizzabili
└── server.js           # Entry point dell'applicazione
```

## Funzionalità principali

### Sistema di autenticazione
- Registrazione nuovo utente
- Login sicuro
- Gestione ruoli (paziente/admin)

### Dashboard utente
- Visualizzazione grafica dell'andamento del peso
- Gestione misurazioni (aggiunta, modifica, eliminazione)
- Visualizzazione piani alimentari personalizzati

### Dashboard amministratore
- Gestione completa dei pazienti
- Monitoraggio delle recensioni
- Gestione delle richieste di contatto

### Sistema di contatti
- Form di contatto per utenti non registrati
- Gestione delle richieste da parte dell'amministratore

---

## Autore
Osama Foutih - Studente di Informatica presso l'Università del Piemonte Orientale
