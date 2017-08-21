const _ = require('lodash');
const uuid = require('uuid');
const moment = require('moment');
const bcrypt = require('bcrypt');
const Joi = require('joi');

class DataSource {
  constructor(config, db) {
    this.config = config;
    this.db = db;

    this.usersTable = this.ensureCollection('users');
    this.bountiesTable = this.ensureCollection('bounties');
    this.transactionsTable = this.ensureCollection('transactions');

    this.schema = {
      bounty: Joi.object().keys({
        description: Joi.string().min(3).required(),
        value: Joi.number().required(),
        code: Joi.string().required(),
        target: Joi.number().min(0).max(255).required(),
        urlKey: Joi.string().min(1).max(255),
      }),
      user: Joi.object().keys({
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required(),
        photo: Joi.string().min(1).required(),
        dateOfBirth: Joi.string().min(1).required(),
        walletId: Joi.number().required(),
      }),
    };
    this.schema.validate = (obj, schema) => (
      Joi.validate(obj, schema, { abortEarly: false })
    );
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

  saveUser(user) {
    return this.usersTable.update(user);
  }

  clearUsers() {
    return this.usersTable.findAndRemove({});
  }

  createBounties(data) {
    return this.bountiesTable.insert(data);
  }

  getBounties() {
    return this.bountiesTable.find();
  }

  getBounty(id) {
    return this.bountiesTable.find({ $loki: { $eq: Number(id) } })[0];
  }

  getBountyByKey(key) {
    console.log(key);
    return this.bountiesTable.find({ urlKey: { $eq: key } })[0];
  }

  createTransactions(data) {
    return this.transactionsTable.insert(data);
  }

  getTransactions() {
    return this.transactionsTable.find();
  }

  getTransactionsForUser(userId) {
    return this.transactionsTable.find({ userId: { $eq: userId } });
  }

  getTransactionsForWallet(walletId) {
    return this.transactionsTable.find({ walletId: { $eq: walletId } });
  }

  removeTransaction(transactionId) {
    const t = this.transactionsTable.get(transactionId);
    this.transactionsTable.remove(t);
    return t;
  }
}

module.exports = DataSource;
