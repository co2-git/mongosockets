import {Server as WSServer} from 'ws';
import maeva from 'maeva';
import mongodb from 'maeva-mongodb';
import log from './log';

export default class Server extends WSServer {
  mongodbUrl;
  port;
  conn;
  ws = [];

  constructor({mongodbUrl, port}) {
    try {
      log.info('Will create a new Relay Server now', {mongodbUrl, port});
      super({port});
      this.port = port;
      this.mongodbUrl = mongodbUrl;
      this.init();
      this.on('connection', (ws) => this.connect(ws));
    } catch (error) {
      log.error('Could not construct Relay Server', error);
    }
  }

  connect(ws) {
    log.info('New relay connection');

    this.ws.push(ws);

    ws.on('message', async (data) => {
      const message = JSON.parse(data);
      const {action, collection, id, get, set} = message;
      log.info('Got message', message);

      switch (action) {

      case 'insert': {
        try {
          log.info('Inserting', {collection, get, set});
          const results = await this.conn.operations.insert(
            {collection, get, set},
          );
          log.success('inserted', {collection, get, set, results});
          ws.send(JSON.stringify({id, results}));
        } catch (error) {
          log.error(error.message, error.stack || error);
        }
      } break;

      case 'find': {
        try {
          log.info('Finding', {collection, get});
          const {results} = await this.conn.operations.find(
            {collection, get},
          );
          log.success('found', {collection, get, results});
          ws.send(JSON.stringify({id, results}));
        } catch (error) {
          log.error(error.message, error.stack || error);
        }
      } break;

      case 'update': {
        try {
          log.info('Update', {collection, get, set});
          const results = await this.conn.operations.update(
            {collection, get, set},
          );
          log.success('Update', {collection, get, set, results});
          ws.send(JSON.stringify({id, results}));
        } catch (error) {
          log.error(error.message, error.stack || error);
        }
      } break;

      }
    });
  }

  broadcast(message) {
    for (const ws of this.ws) {
      ws.send(JSON.stringify(message));
    }
  }

  async init() {
    return new Promise(async (resolve, reject) => {
      try {
        log.info('Connect to MongoDB', this.mongodbUrl);
        this.conn = await maeva.connect(
          mongodb(`mongodb://${this.mongodbUrl}`),
        );
        log.success('Connected to MongoDB :)', this.mongodbUrl);
        this.broadcast('connectedToMongodb');
      } catch (error) {
        log.error(error.message, error.stack);
        reject(error);
      }
    });
  }
}
