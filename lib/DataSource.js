/* eslint class-methods-use-this: 0 */
const bcrypt = require('bcrypt');
const Joi = require('joi');

class DataSource {
  constructor(config, db) {
    this.config = config;
    this.db = db;

    this.schema = {
      bounty: Joi.object().keys({
        description: Joi.string().min(3).required(),
        value: Joi.number().required(),
        code: Joi.number().required(),
        targetId: Joi.number().min(0).max(255).required(),
        urlKey: Joi.string().min(1).max(255),
      }),
      user: Joi.object().keys({
        firstName: Joi.string().min(1).required(),
        lastName: Joi.string().min(1).required(),
        username: Joi.string().min(1).required(),
        photo: Joi.string().min(1),
        dateOfBirth: Joi.string().min(1),
        walletId: Joi.number(),
        password: Joi.string().min(1),
        admin: Joi.bool(),
      }),
    };
    this.schema.validate = (obj, schema) => (
      Joi.validate(obj, schema, { abortEarly: false })
    );
  }

  addJoiError(result, path, type, message) {
    result.error = result.error || {}; // eslint-disable-line no-param-reassign
    result.error.details = result.error.details || []; // eslint-disable-line no-param-reassign
    result.error.details.push({
      message: `"${path}" ${message}`,
      path,
      type,
      context: {},
    });
  }

  static hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync());
  }

  static verifyPassword(password, passwordHash) {
    return bcrypt.compareSync(password, passwordHash);
  }

  async createUsers(data) {
    return this.db.models.user.bulkCreate(data);
  }

  async getUsers(filter = {}) {
    return this.db.models.user.findAll(filter);
  }

  async getUser(id) {
    return this.db.models.user.findOne({ where: { id } });
  }

  async saveUser(user) {
    return user.save();
  }

  async clearUsers() {
    return this.db.models.user.destroy({ truncate: true });
  }

  async authUser(username, password) {
    const user = await this.db.models.user.findOne({ where: { username } });
    if (user && DataSource.verifyPassword(password, user.password)) {
      return user;
    }
    return null;
  }

  async createBounty(data) {
    return this.db.models.bounty.create(data);
  }

  async getBounties(filter = {}) {
    return this.db.models.bounty.findAll(filter);
  }

  async getBounty(id) {
    return this.db.models.bounty.findOne({ where: { id } });
  }

  async getBountyByKey(key) {
    return this.db.models.bounty.findOne({ where: { urlKey: key } });
  }

  async createTransaction(data) {
    return this.db.models.transaction.create(data);
  }

  async createTransactions(data) {
    return this.db.models.transaction.bulkCreate(data);
  }

  async getTransactions(filter = {}) {
    return this.db.models.transaction.findAll(filter);
  }

  async getTransactionsForWallet(walletId) {
    return this.db.models.transaction.findAll({ where: { walletId } });
  }

  async removeTransaction(id) {
    return this.db.models.transaction.destroy({ where: { id } });
  }

  async clearTransactions() {
    return this.db.models.transaction.destroy({ truncate: true });
  }

  async getUsersTransactionSum(withAdmins = false) {
    const options = {
      attributes: [
        'id',
        'firstName',
        'lastName',
        'photo',
        'username',
        'walletId',
        'admin',
        [this.db.fn('COALESCE', this.db.fn('SUM', this.db.col('transactions.deltaCoin')), 0), 'coins'],
      ],
      group: ['user.id'],
      include: [{
        model: this.db.models.transaction,
        attributes: [],
        duplicating: false,
      }],
    };
    if (!withAdmins) {
      options.where = {
        admin: false,
      };
    }
    return this.db.models.user.findAll(options);
  }
}

module.exports = DataSource;
