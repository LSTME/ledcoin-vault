const home = require('./home');
const users = require('./users');
const bounties = require('./bounties');

module.exports = {
  apply(app) {
    app.use('/', home);
    app.use('/users', users);
    app.use('/bounties', bounties);
  },
};
