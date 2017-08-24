const _ = require('lodash');

module.exports = {
  genericRecord(obj) {
    return _.merge({
      createdAt: new Date(),
      updatedAt: new Date(),
    }, obj);
  },
};