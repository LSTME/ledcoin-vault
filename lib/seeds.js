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
  const users = _.times(10, () => genericRecord({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  }));
  dataSource.createUsers(users);
  logger.profile('insertUsers');

  logger.info('Seeding done.');
};
