/* global WebSocket */

import uuid from 'uuid';

// Create a new relay server
function init(conn, url) {
  // Start a new relay
  console.info('start relay', url);
  conn.ws = new WebSocket(url);

  // Catch relay server errors
  conn.ws.onerror = (error) => {
    console.error('relay error', error.stack);
  };

  // React on new relay server started
  conn.ws.onopen = () => {
    console.info('start relay', url);
  };

  // React on new relay server being closed
  conn.ws.onclose = () => {
    console.warn('start relay', 'closed', url);
    init(conn, url);
  };
}

export default function connect(url) {
  return (conn) => new Promise(async (resolve, reject) => {
    try {
      init(conn, url);

      let callbacks = [];

      conn.ws.onmessage = ({data}) => {
        let message;
        try {
          message = JSON.parse(data);
          console.info('message', {data, message});
        } catch (error) {
          console.warn('Can not parse data from server', data);
          console.warn('parse', error);
        } finally {
          if (message) {
            for (const fn of callbacks) {
              fn(message);
            }
          }
        }
      };

      conn.operations = {
        insert: (inserter) =>
        new Promise(async (resolveInsert, rejectInsert) => {
          try {
            console.info('insert', inserter);

            const
              id = uuid.v4(),
              doc = {
                action: 'insert',
                id,
                ...inserter,
              },
              raw = JSON.stringify(doc);

            console.info('send', doc);

            conn.ws.send(raw);

            console.info('send', raw);

            const callback = ({id: messageId, results}) => {
              if (messageId === id) {
                console.info('response', {id, results});
                callbacks = callbacks.filter((cb) => cb !== callback);
                resolveInsert(results);
              }
            };

            callbacks.push(callback);
          } catch (error) {
            console.warn('insert', error.stack);
            rejectInsert(error);
          }
        }),

        find: (finder) => new Promise(async (resolveFind, rejectFind) => {
          try {
            console.info('find', finder);

            const
              id = uuid.v4(),
              doc = {
                action: 'find',
                id,
                ...finder,
              },
              raw = JSON.stringify(doc);

            console.info('send', doc);

            conn.ws.send(raw);

            console.info('send', raw);

            const callback = ({id: messageId, results}) => {
              if (messageId === id) {
                console.info('response', {id, results});
                callbacks = callbacks.filter((cb) => cb !== callback);
                resolveFind(results);
              }
            };

            callbacks.push(callback);
          } catch (error) {
            console.warn('find', error);
            rejectFind(error);
          }
        }),

        update: (updater) =>
        new Promise(async (resolveUpdate, rejectUpdate) => {
          try {
            console.info('update', updater);

            const
              id = uuid.v4(),
              doc = {
                action: 'update',
                id,
                ...updater,
              },
              raw = JSON.stringify(doc);

            console.info('send', doc);

            conn.ws.send(raw);

            console.info('send', raw);

            const callback = ({id: messageId, results}) => {
              if (messageId === id) {
                console.info('response', {id, results});
                callbacks = callbacks.filter((cb) => cb !== callback);
                resolveUpdate(results);
              }
            };

            callbacks.push(callback);
          } catch (error) {
            console.warn('update', error.stack);
            rejectUpdate(error);
          }
        }),
      };

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
