const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', (req, res) => {
  const { dataSource } = req;
  const transactions = dataSource.getTransactions();
  const users = _.keyBy(dataSource.getUsers(), i => i.$loki);
  const bounties = _.keyBy(dataSource.getBounties(), i => i.$loki);
  res.render('transactions/index', { transactions, users, bounties });
});

module.exports = router;
