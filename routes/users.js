const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', (req, res) => {
  const { dataSource } = req;
  const users = dataSource.getUsers();
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
  const user = dataSource.getUser(req.params.id)[0];
  res.render('users/edit', { user });
});

router.post('/:id', (req, res) => {
  const ds = req.dataSource;

  const changes = _.pick(req.body, ['firstName', 'lastName', 'photo', 'dateOfBirth', 'walletId']);
  const result = ds.schema.validate(changes, ds.schema.user);
  console.log(result);

  if (result.error) {
    const user = ds.getUser(req.params.id)[0];
    res.render('users/edit', { user, result });
  } else {
    const user = ds.getUser(req.params.id)[0];
    ds.saveUser(_.merge(user, changes));
    res.redirect('/users');
  }
});

router.get('/:id/enroll', (req, res) => {
  const { dataSource } = req;
  const user = dataSource.getUser(req.params.id)[0];
  const enrollCode = '0001021020112233eefdfeff';
  res.render('users/enroll', { user, enrollCode });
});

router.get('/:id', (req, res) => {
  const { dataSource } = req;
  const user = dataSource.getUser(req.params.id)[0];
  res.render('users/show', { user });
});

module.exports = router;
