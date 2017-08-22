const me = require('./me');
const users = require('./users');
const bounties = require('./bounties');
const transactions = require('./transactions');
const terminals = require('./terminals');

module.exports = {
  apply(app) {
    app.get('/', (req, res) => (req.user ?
      res.redirect('/me') :
      res.redirect('/login')),
    );
    app.use('/', me);
    app.use('/users', users);
    app.use('/bounties', bounties);
    app.use('/transactions', transactions);
    app.use('/terminals', terminals);
  },
};
