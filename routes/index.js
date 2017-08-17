const home = require('./home');
const users = require('./users');
const bounties = require('./bounties');
const transactions = require('./transactions');
const terminals = require('./terminals');

module.exports = {
  apply(app) {
    app.use('/', home);
    app.use('/users', users);
    app.use('/bounties', bounties);
    app.use('/transactions', transactions);
    app.use('/terminals', terminals);
  },
};
