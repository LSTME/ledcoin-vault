const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', (req, res) => {
  const { dataSource } = req;
  const transactions = _.sortBy(dataSource.getTransactions(), ['createdAt']).reverse();
  const users = _.keyBy(dataSource.getUsers(), i => i.$loki);
  const bounties = _.keyBy(dataSource.getBounties(), i => i.$loki);
  res.render('transactions/index', { transactions, users, bounties });
});

router.post('/:id/delete', (req, res) => {
  const { dataSource } = req;
  dataSource.removeTransaction(req.params.id);
  res.redirect('back');
});

module.exports = router;
