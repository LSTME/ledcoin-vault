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

    this.schema = {
      bounty: Joi.object().keys({
        description: Joi.string().min(3).required(),
        value: Joi.number().required(),
        code: Joi.string().required(),
      }),
      user: Joi.object().keys({
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required(),
        photo: Joi.string().min(1).required(),
        dateOfBirth: Joi.string().min(1).required(),
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
}

module.exports = DataSource;
