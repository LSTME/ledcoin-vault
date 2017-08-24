const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', async (req, res) => {
  const { dataSource } = req;
  const transactions = _.sortBy(await dataSource.getTransactions(), ['createdAt']).reverse();
  const users = _.keyBy(await dataSource.getUsers(), i => i.id);
  const bounties = _.keyBy(await dataSource.getBounties(), i => i.id);
  res.render('transactions/index', { transactions, users, bounties });
});

router.post('/:id/delete', async (req, res) => {
  const { dataSource } = req;
  await dataSource.removeTransaction(req.params.id);
  res.redirect('back');
});

module.exports = router;
