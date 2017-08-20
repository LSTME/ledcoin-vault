/* eslint no-case-declarations: 0 */
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
  res.render('terminals/show', { terminal, commands: terminal.availableCommands() });
});

router.post('/:id', (req, res) => {
  const terminal = req.context.terminals[req.params.id];
  if (terminal) {
    switch (req.body.protocol) {
      case 'TCP':
        const args = req.body.message.split('\n').map(r =>
          (r.indexOf(',') > 0 ?
            r.split(',').map(v => Number(v)) :
            Number(r)),
        );
        terminal.tell(req.body.command, args)
          .then(response => console.log('got response to', req.body.command, response))
          .catch(error => console.error(error));
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
