import {Server as WSServer} from 'ws';
import Server from './Server';
import log from './log';

const PORT = process.argv[2] || process.env.PORT || 8080;

log.info('Starting new MotherShip', {PORT});

const wss = new WSServer({port: PORT});

log.success('MotherShip is awake', {PORT});

wss.on('connection', (ws) => {
  log.info('Who dares disturb MotherShip?');

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    log.info('What is it you say?', {message});
    switch (message.action) {
    case 'start': {
      const {mongodbUrl, port} = message;
      log.info('Received start Relay Server request', {mongodbUrl, port});
      new Server({mongodbUrl, port});
    }
      break;
    }
  });
});
