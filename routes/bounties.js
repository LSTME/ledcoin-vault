const express = require('express');
const _ = require('lodash');
const Proto = require('../utils/LedcoinProtocol');

const router = express.Router();
const proto = new Proto();

// router.get('/:id', (req, res, next) => {
//   const { dataSource } = req;
//   const bounty = dataSource.getBounty(req.params.id)[0];
//   res.render('bounty', { bounty });
// });

router.get('/', async (req, res) => {
  const { dataSource } = req;
  const bounties = await dataSource.getBounties();
  res.render('bounties/index', { bounties });
});

router.get('/new', (req, res) => {
  res.render('bounties/new');
});

router.post('/create', async (req, res) => {
  const ds = req.dataSource;
  const result = ds.schema.validate(req.body, ds.schema.bounty);

  if (result.error) {
    res.render('bounties/new', { result });
  } else {
    await req.dataSource.createBounty(req.body);
    res.redirect('/bounties');
  }
});

router.get('/secret/:key', async (req, res) => {
  const { dataSource } = req;
  const bounty = await dataSource.getBountyByKey(req.params.key);
  const bountyCodeData = proto.SetBounty(
    Number(bounty.code), // ID
    Number(bounty.targetId), // Recipient
    Number(bounty.value), // Value
  ).toJSON().data;
  res.render('bounties/secret', { bounty, bountyCodeData });
});

router.get('/:id/edit', async (req, res) => {
  const { dataSource } = req;
  const bounty = await dataSource.getBounty(req.params.id);
  res.render('bounties/edit', { bounty });
});

router.post('/:id', async (req, res) => {
  const ds = req.dataSource;
  const bounty = await ds.getBounty(req.params.id);
  const changes = _.pick(req.body, ['description', 'value', 'code', 'targetId', 'urlKey']);
  const result = ds.schema.validate(changes, ds.schema.bounty);

  if (result.error) {
    res.render('bounties/edit', { bounty, result });
  } else {
    await ds.saveUser(_.merge(bounty, changes));
    res.redirect('/bounties');
  }
});

router.get('/:id', async (req, res) => {
  const { dataSource } = req;
  const bounty = await dataSource.getBounty(req.params.id);
  bounty.url = bounty.urlKey ? `/bounties/secret/${bounty.urlKey}` : undefined;
  res.render('bounties/show', { bounty });
});

module.exports = router;
