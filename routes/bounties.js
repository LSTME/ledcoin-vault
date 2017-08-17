const express = require('express');
const _ = require('lodash');

const router = express.Router();

// router.get('/:id', (req, res, next) => {
//   const { dataSource } = req;
//   const bounty = dataSource.getBounty(req.params.id)[0];
//   res.render('bounty', { bounty });
// });

router.get('/', (req, res) => {
  const { dataSource } = req;
  const bounties = dataSource.getBounties();
  res.render('bounties/index', { bounties });
});

router.get('/new', (req, res) => {
  res.render('bounties/new');
});

router.post('/create', (req, res) => {
  const ds = req.dataSource;
  const result = ds.schema.validate(req.body, ds.schema.bounty);
  console.log(result);

  if (result.error) {
    res.render('bounties/new', { result });
  } else {
    const bounty = req.dataSource.createBounties(req.body);
    console.log(bounty);
    res.redirect('/bounties');
  }
});

router.get('/secret/:key', (req, res) => {
  const { dataSource } = req;
  const bounty = dataSource.getBountyByKey(req.params.key);
  const bountyCodeData = 'fff000';
  res.render('bounties/secret', { bounty, bountyCodeData });
});

router.get('/:id/edit', (req, res) => {
  const { dataSource } = req;
  const bounty = dataSource.getBounty(req.params.id);
  res.render('bounties/edit', { bounty });
});

router.post('/:id', (req, res) => {
  const ds = req.dataSource;
  const bounty = ds.getBounty(req.params.id);
  const changes = _.pick(req.body, ['description', 'value', 'code', 'target', 'urlKey']);
  const result = ds.schema.validate(changes, ds.schema.bounty);

  if (result.error) {
    res.render('bounties/edit', { bounty, result });
  } else {
    ds.saveUser(_.merge(bounty, changes));
    res.redirect('/bounties');
  }
});

router.get('/:id', (req, res) => {
  const { dataSource } = req;
  const bounty = dataSource.getBounty(req.params.id);
  bounty.url = bounty.urlKey ? `/bounties/secret/${bounty.urlKey}` : undefined;
  res.render('bounties/show', { bounty });
});

module.exports = router;
