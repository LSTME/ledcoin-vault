const io = require('socket.io');

const PORT = 8080;
const terminalState = {
  pins: [{ value: 0 }, { value: 1 }],
};

const ws = io(PORT);

ws.on('connection', (client) => {
  console.log('incoming connection');

  client.on('pin:list', (data) => {
    console.log('INCOMING', 'pin:list', data);
    client.emit('pin:list', terminalState.pins);
  });

  client.on('pin:read', (data) => {
    console.log('INCOMING', 'pin:read', data);
    const pin = terminalState.pins[data.num];
    client.emit('pin:read', pin);
  });

  client.on('pin:write', (data) => {
    console.log('INCOMING', 'pin:write', data);
    const pin = terminalState.pins[data.num];
    if (pin) {
      pin.value = data.value;
    } else {
      terminalState.pins[data.num] = { value: data.value };
    }
  });
});

console.log(`Mock server started at port ${PORT}`);
