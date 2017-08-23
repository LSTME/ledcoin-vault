const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/me', (req, res) => {
  const { dataSource } = req;
  const user = req.user;
  const trans = _.sortBy(dataSource.getTransactionsForWallet(user.walletId), ['createdAt']).reverse();
  res.render('users/show', { admin: false, user, transactions: trans });
});

module.exports = router;
