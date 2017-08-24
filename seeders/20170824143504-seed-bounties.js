const _ = require('lodash');
const faker = require('faker/locale/en');
const { genericRecord } = require('../lib/util');
const { sequelize: db } = require('../models');

const logger = require('../lib/logger');

faker.seed(1337);

module.exports = {
  async up(queryInterface, Sequelize) {
    logger.profile('insertBounties');
    const bounties = _.times(5, _i => genericRecord({
      value: faker.random.number({ min: 1, max: 5 }),
      code: faker.internet.password(4),
      description: faker.lorem.sentence(),
      targetId: 255,
      urlKey: faker.lorem.slug(),
    }));
    await queryInterface.bulkInsert('bounties', bounties, {});
    logger.profile('insertBounties');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bounties', null, {});
  },
};
