const _ = require('lodash');
const moment = require('moment');
const faker = require('faker/locale/en');
const { genericRecord } = require('../lib/util');
const DataSource = require('../lib/DataSource');
const { sequelize: db } = require('../models');

const logger = require('../lib/logger');

faker.seed(1337);

module.exports = {
  async up(queryInterface, Sequelize) {
    logger.profile('insertUsers');
    let users = _.times(10, i => genericRecord({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      password: DataSource.hashPassword('password'),
      admin: i === 0,
      photo: '',
      dateOfBirth: faker.date.past(10, '2010-01-01'),
      walletId: i + 1,
    }));
    users.push(genericRecord({
      firstName: 'Admin',
      lastName: 'Adminovic',
      username: 'admin',
      dateOfBirth: moment('1970-01-01').toDate(),
      password: DataSource.hashPassword('admin'),
      admin: true,
    }));
    await queryInterface.bulkInsert('users', users, {});
    users = await db.models.user.findAll();
    users.forEach(u => console.log(`user => ${u.username} | ${u.admin ? 'ADMIN' : 'USER'}`));
    logger.profile('insertUsers');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
