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
    dateOfBirth: faker.date.past(10, '2010-01-01'),
  }));
  dataSource.createUsers(users);
  logger.profile('insertUsers');

  logger.profile('insertBounties');
  const bounties = _.times(5, _i => genericRecord({
    value: faker.random.number({ min: 1, max: 5 }),
    code: faker.internet.password(4),
    description: faker.lorem.sentence(),
  }));
  dataSource.createBounties(bounties);
  logger.profile('insertBounties');

  logger.info('Seeding done.');
};
