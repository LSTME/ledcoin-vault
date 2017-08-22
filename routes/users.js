const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', (req, res) => {
  const { dataSource } = req;
  const users = _.sortBy(dataSource.getUsers(), ['admin', 'lastName']);
  res.render('users/index', { users });
});

router.get('/clearConfirm', (req, res) => {
  res.render('users/clearConfirm');
});

router.post('/clear', (req, res) => {
  req.dataSource.clearUsers();
  res.redirect('/users');
});

router.get('/:id/edit', (req, res) => {
  const { dataSource } = req;
  const user = dataSource.getUser(req.params.id);
  res.render('users/edit', { user });
});

router.post('/:id/change', (req, res) => {
  const ds = req.dataSource;
  const user = ds.getUser(req.params.id);
  ds.createTransactions({
    userId: Number(user.$loki),
    walletId: Number(user.walletId),
    deltaCoin: Number(req.body.deltaCoin),
    description: req.body.description,
    type: req.body.type,
    targetId: null,
  });
  res.redirect(`/users/${req.params.id}`);
});

router.post('/:id', (req, res) => {
  const ds = req.dataSource;
  const user = ds.getUser(req.params.id);
  const changes = _.pick(req.body, ['firstName', 'lastName', 'username', 'photo', 'dateOfBirth', 'walletId']);
  const result = ds.schema.validate(changes, ds.schema.user);

  changes.walletId = Number(changes.walletId);
  changes.admin = Number(req.body.admin === 'on');

  // make sure username is uniq
  const isUsernameUniq = ds.getUsers({ username: changes.username, $loki: { $ne: user.$loki } }).length === 0;
  if (!isUsernameUniq) {
    result.error = result.error || {};
    result.error.details = result.error.details || [];
    result.error.details.push({
      message: '"username" must be uniq',
      path: 'username',
      type: 'any.uniq',
      context: {},
    });
  }

  if (req.body.password.length > 0) {
    changes.password = ds.pHash(req.body.password);
  }

  if (result.error) {
    res.render('users/edit', { user, result });
  } else {
    ds.saveUser(_.merge(user, changes));
    res.redirect('/users');
  }
});

router.get('/:id/enroll', (req, res) => {
  const { dataSource } = req;
  const user = dataSource.getUser(req.params.id);
  const enrollCode = '0001021020112233eefdfeff';
  res.render('users/enroll', { user, enrollCode });
});

router.get('/:id', (req, res) => {
  const { dataSource } = req;
  const user = dataSource.getUser(req.params.id);
  const transactions = _.sortBy(dataSource.getTransactionsForWallet(user.walletId), ['createdAt']).reverse();
  res.render('users/show', { user, transactions, adminLayout: true });
});

module.exports = router;
