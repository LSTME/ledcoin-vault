const _ = require('lodash');
const uuid = require('uuid');
const moment = require('moment');
const bcrypt = require('bcrypt');

class DataSource {
  constructor(config, db) {
    this.config = config;
    this.db = db;

    this.usersTable = this.ensureCollection('users');
  }

  ensureCollection(collectionName, args) {
    return this.db.getCollection(collectionName) || this.db.addCollection(collectionName, args);
  }

  createUsers(data) {
    return this.usersTable.insert(data);
  }

  getUsers() {
    return this.usersTable.find();
  }

  getUser(id) {
    return this.usersTable.find({ $loki: { $eq: Number(id) } });
  }
}

module.exports = DataSource;
