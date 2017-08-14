const _ = require('lodash');
const uuid = require('uuid');
const moment = require('moment');
const bcrypt = require('bcrypt');

class DataSource {
  constructor(config, db) {
    this.config = config;
    this.db = db;
  }

}

module.exports = DataSource;
