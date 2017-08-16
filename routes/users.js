const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  const { dataSource } = req;
  const users = dataSource.getUsers();
  res.render('users/index', { users });
});

router.get('/clearConfirm', (req, res, next) => {
  res.render('users/clearConfirm');
});

router.post('/clear', (req, res) => {
  req.dataSource.clearUsers();
  res.redirect('/users');
});

router.get('/:id', (req, res, next) => {
  const { dataSource } = req;
  const user = dataSource.getUser(req.params.id)[0];
  res.render('users/show', { user });
});

module.exports = router;
