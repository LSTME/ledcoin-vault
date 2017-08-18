/* eslint no-case-declarations: 0 */
const express = require('express');
const Proto = require('../utils/LedcoinProtocol');

const router = express.Router();
const proto = new Proto();

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
  res.render('terminals/show', { terminal, commands: Object.keys(proto.Commands) });
});

router.post('/:id', (req, res) => {
  const terminal = req.context.terminals[req.params.id];
  if (terminal) {
    switch (req.body.protocol) {
      case 'TCP':
        const cmd = proto.Commands[req.body.command];
        if (cmd) {
          const args = req.body.message.split('\n').map(r =>
            r.split(',').map(v => Number(v)),
          );
          const buffer = proto[req.body.command](...args);
          terminal.tell(buffer);
        }
        break;
      case 'WEBSOCKET':
        terminal.send(req.body.message);
        break;
      default:
        break;
    }
  }

  res.json({ status: 'ok' });
});

module.exports = router;
