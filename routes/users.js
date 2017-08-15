const express = require('express');

const router = express.Router();

router.get('/:id', (req, res, next) => {
  const { dataSource } = req;
  const user = dataSource.getUser(req.params.id)[0];
  res.render('users/show', { user });
});

/* GET users listing. */
router.get('/', (req, res, next) => {
  const { dataSource } = req;
  const users = dataSource.getUsers();
  res.render('users/index', { users });
});

module.exports = router;
