'use strict';

const db = require("../db");

class PianiAlimentariDAO {
  constructor(database) {
    this.db = database;
  }
  
  
}

module.exports = new PianiAlimentariDAO(db);

