const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/me', async (req, res) => {
  const { dataSource } = req;
  const user = req.user;
  const transactions = await dataSource.getTransactionsForWallet(user.walletId);
  const trans = _.sortBy(transactions, ['createdAt']).reverse();
  res.render('users/show', { admin: false, user, transactions: trans });
});

module.exports = router;
