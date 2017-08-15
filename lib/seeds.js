const _ = require('lodash');
const moment = require('moment');
const faker = require('faker/locale/en');

const logger = require('./logger');

faker.seed(1337);

const genericRecord = obj => _.merge({
  id: faker.random.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
}, obj);

module.exports = (dataSource) => {
  logger.info('Seeding ...');

  logger.profile('insertUsers');
  const users = _.times(10, _i => genericRecord({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    photo: faker.internet.avatar(),
    balance: faker.random.number({ min: 10, max: 50 }),
    syncedAt: faker.date.past(),
    dateOfBirth: faker.date.past(10, '2010-01-01'),
  }));
  dataSource.createUsers(users);
  logger.profile('insertUsers');

  logger.info('Seeding done.');
};
