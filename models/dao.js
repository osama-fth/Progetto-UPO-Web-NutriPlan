'use strict'

const utentiDAO = require('./daos/utentiDAO');
const misurazioniDAO = require('./daos/misurazioniDAO');
const recensioniDAO = require('./daos/recensioniDAO');
const contattiDAO = require('./daos/contattiDAO');
const pianiAlimentariDAO = require('./daos/pianiAlimentariDAO');

module.exports = {
    // Utenti
    newUser: utentiDAO.newUser,
    getAllPazienti: utentiDAO.getAllPazienti,
    deleteAccount: utentiDAO.deleteAccount,

    // Misurazioni
    insertMisurazione: misurazioniDAO.insertMisurazione,
    getMisurazioniByUserId: misurazioniDAO.getMisurazioniByUserId,
    getMisurazioneById: misurazioniDAO.getMisurazioneById,
    updateMisurazione: misurazioniDAO.updateMisurazione,
    deleteMisurazione: misurazioniDAO.deleteMisurazione,
    getMisurazioniByUtente : misurazioniDAO.getMisurazioniByUtente,

    // Recensioni
    getAllRecensioni: recensioniDAO.getAllRecensioni,
    getAllRecensioniWithUserInfo: recensioniDAO.getAllRecensioniWithUserInfo,
    getRecensioneById: recensioniDAO.getRecensioneById,
    getRecensioneByUserId: recensioniDAO.getRecensioneByUserId,
    insertRecensione: recensioniDAO.insertRecensione,
    updateRecensione: recensioniDAO.updateRecensione,
    deleteRecensione: recensioniDAO.deleteRecensione,

    // Piani Alimentari
    getPianiAlimentariByUserId: pianiAlimentariDAO.getPianiAlimentariByUserId,
    getPianoAlimentareById: pianiAlimentariDAO.getPianoAlimentareById,
    scaricaPianoAlimentare: pianiAlimentariDAO.scaricaPianoAlimentare,

    // Contatti
    inserisciRichiestaContatto: contattiDAO.inserisciRichiestaContatto,
    getAllRichiesteContatto: contattiDAO.getAllRichiesteContatto,
    getRichiestaContattoById: contattiDAO.getRichiestaContattoById,
    deleteRichiestaContatto: contattiDAO.deleteRichiestaContatto
};
