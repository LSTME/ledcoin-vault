const express = require('express');

const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  const { dataSource } = req;
  const users = dataSource.getUsers();
  res.render('users', { users });
});

module.exports = router;
