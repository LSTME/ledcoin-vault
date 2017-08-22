const _ = require('lodash');
const moment = require('moment');
const faker = require('faker/locale/en');

const logger = require('./logger');

faker.seed(1337);

const genericRecord = obj => _.merge({
  createdAt: new Date(),
  updatedAt: new Date(),
}, obj);

const bountyTransaction = (user, target) => genericRecord({
  userId: user.$loki,
  walletId: user.walletId,
  deltaCoin: target.value,
  description: `Seeded for bounty ${target.$loki}`,
  type: 'bounty',
  targetId: target.$loki,
});

const gameTransaction = (user, target, win) => genericRecord({
  userId: user.$loki,
  walletId: user.walletId,
  deltaCoin: win ? 1 : 0, // one coin for win
  description: `Seeded for game with ${target.lastName}(${target.$loki})`,
  type: 'game',
  targetId: target.$loki,
});

const purchaseTransaction = (user, product) => genericRecord({
  userId: user.$loki,
  walletId: user.walletId,
  deltaCoin: -product.price,
  description: `Seeded for purchase with price ${product.price}`,
  type: 'purchase',
  targetId: product.id,
});

module.exports = (dataSource) => {
  logger.info('Seeding ...');

  logger.profile('insertUsers');
  const users = _.times(10, i => genericRecord({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    username: faker.internet.userName(),
    password: dataSource.pHash('password'),
    admin: i === 0,
    photo: faker.internet.avatar(),
    dateOfBirth: faker.date.past(10, '2010-01-01'),
    walletId: i + 1,
  }));
  dataSource.createUsers(users);
  users.forEach(u => console.log(`user => ${u.username} | ${u.admin ? 'ADMIN' : 'USER'}`));
  logger.profile('insertUsers');

  logger.profile('insertBounties');
  const bounties = _.times(5, _i => genericRecord({
    value: faker.random.number({ min: 1, max: 5 }),
    code: faker.internet.password(4),
    description: faker.lorem.sentence(),
    target: 255,
    urlKey: faker.lorem.slug(),
  }));
  dataSource.createBounties(bounties);
  logger.profile('insertBounties');

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
  dataSource.createTransactions(transactions);
  logger.profile('insertTransactions');

  logger.info('Seeding done.');
};
