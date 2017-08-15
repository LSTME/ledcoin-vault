const express = require('express');

const router = express.Router();

// router.get('/:id', (req, res, next) => {
//   const { dataSource } = req;
//   const bounty = dataSource.getBounty(req.params.id)[0];
//   res.render('bounty', { bounty });
// });

router.get('/', (req, res, next) => {
  const { dataSource } = req;
  const bounties = dataSource.getBounties();
  res.render('bounties/index', { bounties });
});

router.get('/new', (req, res, next) => {
  res.render('bounties/new');
});

router.post('/create', (req, res, next) => {
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

module.exports = router;
