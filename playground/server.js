const WebSocket = require('ws');
const http = require('http');
const express = require('express');

const app = express();
const port = process.env.PORT || 9090;
const WebSocketServer = WebSocket.Server;

app.get('/', (req, res) => {
  res.send('Hello CO/DA!');
});


//////////////////////////////////////////////////////////////////////////////////////////
// UDP Transfer Station
//////////////////////////////////////////////////////////////////////////////////////////
// const {Server, Bundle, Client} = require('node-osc');

// var oscServer = new Server(13500, '0.0.0.0', () => {
//   console.log('OSC Server is listening');
// });
// const oscClient = new Client('127.0.0.1', 13600);


// oscServer.on('message', function (msg) {
//   console.log(`Message: ${msg.address},  ${msg.args}, ${msg.args}, ${msg.args}}`);
// });

// oscServer.on('bundle', function (bundle) {
//   bundle.elements.forEach((element, i) => {
//     console.log(`Timestamp: ${bundle.timetag[i]}`);
//     console.log(`Message: ${element}`);
//   });
// });

const osc = require('osc');
// Create an osc.js UDP Port listening on port 8888.
const udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 13500,
  metadata: true,
});

const message = {
  position: [0, 0, 0],
};

let streaming = false;
udpPort.on('message', (oscMsg) => {
  const performerId = oscMsg.address.split('/')[1];
  if (!streaming) {
    console.log('UDP Server Started at Port', udpPort.localPort);
    streaming = true;
  }
  message.id = performerId;
  message.position[0] = oscMsg.args[0].value;
  message.position[1] = oscMsg.args[1].value;
  message.position[2] = oscMsg.args[2].value;
  console.log(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
});

// Open the socket.
udpPort.open();




//////////////////////////////////////////////////////////////////////////////////////////
// WebSocket
//////////////////////////////////////////////////////////////////////////////////////////

const server = http.createServer(app);
server.listen(port);

const wss = new WebSocketServer({ server });
const clients = {};

wss.on('connection', (ws) => {
  const thisSocket = ws;
  let thisId = null;
  thisSocket.isOperator = false;
  ws.on('message', (message) => {
    console.log('onmessage', message);
    const m = JSON.parse(message);
    if (m.type === 'connect') {
      try {
        if (thisId) delete clients[thisId];
        if (Object.keys(clients).includes(m.id)) {
          // console.log('client id conflict:', m.id);
          ws.send(JSON.stringify({ type: 'error' }));
        } else {
          clients[m.id] = ws;
          thisId = m.id;
          // eslint-disable-next-line no-console
          console.log(`Client ${thisId} joined.`);
          ws.send(JSON.stringify({ type: 'success' }));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error on connect', e.stack());
      }
    } else if (m.type === 'operator') {
      thisSocket.isOperator = true;
    } else if (m.type === 'data') {
      wss.clients.forEach((client) => {
        if (client.isOperator && client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  });
  ws.on('close', () => {
    delete clients[thisId];
    // eslint-disable-next-line no-console
    console.log(`Client ${thisId} left.`);
  });
});
