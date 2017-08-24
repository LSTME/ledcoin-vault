const _ = require('lodash');
const faker = require('faker/locale/en');
const { genericRecord } = require('../lib/util');
const { sequelize: db } = require('../models');

const logger = require('../lib/logger');

faker.seed(1337);

const bountyTransaction = (user, target) => genericRecord({
  walletId: user.walletId,
  deltaCoin: target.value,
  description: `Seeded for bounty ${target.id}`,
  type: 'bounty',
  targetId: target.id,
});

const gameTransaction = (user, target, win) => genericRecord({
  walletId: user.walletId,
  deltaCoin: win ? 1 : 0, // one coin for win
  description: `Seeded for game with ${target.lastName}(${target.id})`,
  type: 'game',
  targetId: target.id,
});

const purchaseTransaction = (user, product) => genericRecord({
  walletId: user.walletId,
  deltaCoin: -product.price,
  description: `Seeded for purchase with price ${product.price}`,
  type: 'purchase',
  targetId: product.id,
});

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await db.models.user.findAll({ where: { admin: false } });
    const bounties = await db.models.bounty.findAll();

    logger.profile('insertTransactions');
    const transactions = _.flatten(users.map((user) => {
      const res = [];

      // Randomly pick some bounties and add transactions for those
      bounties.forEach((bounty) => {
        if (faker.random.boolean()) {
          res.push(bountyTransaction(user, bounty));
        }
      });

      // Randomly pick some users and add games between them
      users.forEach((otherUser) => {
        if (otherUser === user) return;
        if (faker.random.boolean()) {
          res.push(gameTransaction(user, otherUser, true));
          res.push(gameTransaction(user, otherUser, false));
        }
      });

      _.times(faker.random.number({ min: 1, max: 3 }), (_n) => {
        res.push(purchaseTransaction(user, {
          price: faker.random.number({ min: 1, max: 3 }),
          id: faker.random.number({ min: 1, max: 255 }),
        }));
      });

      return faker.helpers.shuffle(res);
    }));
    await queryInterface.bulkInsert('transactions', transactions, {});
    logger.profile('insertTransactions');

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transactions', null, {});
  },
};
