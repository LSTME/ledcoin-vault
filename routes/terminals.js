const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  const terminals = req.context.terminals;
  res.render('terminals/index', { terminals });
});

router.get('/:id/log', (req, res) => {
  const terminal = req.context.terminals[req.params.id];
  res.render('terminals/log', { terminal });
});

router.get('/:id', (req, res) => {
  const terminal = req.context.terminals[req.params.id];
  res.render('terminals/show', { terminal });
});

router.post('/:id', (req, res) => {
  const terminal = req.context.terminals[req.params.id];
  console.log(req.body);
  if (terminal) {
    switch (req.body.protocol) {
      case 'TCP':
        terminal.tell(req.body.message);
        break;
      case 'WEBSOCKET':
        terminal.emit(req.body.event, req.body.data);
        break;
      default:
        break;
    }
  }
  res.render('terminals/show', { terminal });
});

module.exports = router;
