/* eslint no-bitwise: 0 */
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

router.get('/new', (req, res) => {
  res.render('users/new');
});

router.get('/import', (req, res) => {
  res.render('users/import');
});

router.post('/import', (req, res) => {
  const now = new Date();
  const ds = req.dataSource;
  const users = req.body.data.split('\n')
    .map(r => r.split(';').map((v, i) => {
      const value = v.trim();
      switch (i) {
        case 0: return v.length > 0 ? Number(value) : null;
        case 3: return value === '1';
        case 5: return ds.pHash(value);
        default: return value;
      }
    }))
    .map(uData => ({
      createdAt: now,
      updatedAt: now,
      walletId: uData[0],
      lastName: uData[1],
      firstName: uData[2],
      admin: uData[3],
      username: uData[4],
      password: uData[5],
      photo: uData[6],
    }));

  // Remove old data, including transactions
  ds.clearUsers();
  ds.clearTransactions();

  ds.createUsers(users);
  res.redirect('/users');
});

router.post('/', (req, res) => {
  const ds = req.dataSource;
  const changes = _.pick(req.body, ['firstName', 'lastName', 'username', 'photo', 'dateOfBirth', 'walletId']);

  _.forEach(changes, (v, k) => {
    if (v.length === 0) {
      delete changes[k];
    }
  });

  if (changes.walletId !== undefined) {
    changes.walletId = Number(changes.walletId);
  }
  changes.admin = req.body.admin === 'on';

  const result = ds.schema.validate(changes, ds.schema.user);

  // make sure username is uniq
  const isUsernameUniq = ds.getUsers({ username: changes.username }).length === 0;
  if (!isUsernameUniq) {
    ds.addJoiError(result, 'username', 'any.uniq', 'must be uniq');
  }

  // when creating user, password is required
  if (req.body.password.length < 5) {
    ds.addJoiError(result, 'password', 'any.length', 'must have at least 5 characters');
  }

  changes.password = ds.pHash(req.body.password);

  if (result.error) {
    res.render('users/new', { result });
  } else {
    changes.createdAt = new Date();
    changes.updatedAt = new Date();
    ds.createUsers([changes]);
    res.redirect('/users');
  }
});

router.post('/:id/sync', (req, res) => {
  const ds = req.dataSource;
  const user = ds.getUser(req.params.id);
  const term = req.context.terminals[req.body.terminal];
  if (term && user) {
    term.toggleRedLed(true);
    term.tell('GetAuth', [0])
      .then((resp) => {
        if (resp[0] === user.walletId) {
          console.log('Correct wallet ID, SYNCING');
          const value = ds.getTransactionsForWallet(user.walletId).reduce((acc, t) => acc + Number(t.deltaCoin), 0);
          return term.tell('WriteEEPROM', [2, [(value >> 8) & 0xFF, value & 0xFF]]);
        }
        return false;
      })
      .then((res) => {
        term.toggleRedLed(false);
        return term.tell('DeAuth', [0], false);
      })
      .catch((e) => {
        console.log('error running procedure', e);
        term.toggleRedLed(false);
        return term.tell('DeAuth', [0], false);
      });
  }

  res.redirect(`/users/${req.params.id}`);
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

  _.forEach(changes, (v, k) => {
    if (v.length === 0) {
      delete changes[k];
    }
  });

  if (changes.walletId !== undefined) {
    changes.walletId = Number(changes.walletId);
  }
  changes.admin = req.body.admin === 'on';

  const result = ds.schema.validate(changes, ds.schema.user);

  // make sure username is uniq
  const isUsernameUniq = ds.getUsers({ username: changes.username, $loki: { $ne: user.$loki } }).length === 0;
  if (!isUsernameUniq) {
    ds.addJoiError(result, 'username', 'any.uniq', 'must be uniq');
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
  res.render('users/show', { user, transactions, adminLayout: true, terminals: Object.keys(req.context.terminals) || [] });
});

module.exports = router;
