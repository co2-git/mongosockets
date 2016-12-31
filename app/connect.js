/* global WebSocket */
import uuid from 'uuid';

// Create a new relay server
function init(conn, url) {
  // Start a new relay
  console.log('mongosockets | start relay', url);
  conn.ws = new WebSocket(url);

  // Catch relay server errors
  conn.ws.onerror = (error) => {
    console.log('mongosockets | relay error', error.stack);
  };

  // React on new relay server started
  conn.ws.onopen = () => {
    console.log('mongosockets | tart relay', url);
  };

  // React on new relay server being closed
  conn.ws.onclose = () => {
    console.log('mongosockets | tart relay', 'closed', url);
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
          console.log('mongosockets | message', {data, message});
        } catch (error) {
          console.log('mongosockets | Can not parse data from server', data);
          console.log('mongosockets | parse', error);
        } finally {
          if (message) {
            for (const callback of callbacks) {
              return callback(message);
            }
          }
        }
      };

      conn.operations = {
        insert: (inserter) =>
        new Promise(async (resolveInsert, rejectInsert) => {
          try {
            console.log('mongosockets | insert', inserter);

            const
              id = uuid.v4(),
              doc = {
                action: 'insert',
                id,
                ...inserter,
              },
              raw = JSON.stringify(doc);

            console.log('mongosockets | send', doc);

            conn.ws.send(raw);

            console.log('mongosockets | end', raw);

            const callback = ({id: messageId, results}) => {
              if (messageId === id) {
                console.log('mongosockets | response', {id, results});
                callbacks = callbacks.filter((cb) => cb !== callback);
                resolveInsert(results);
              }
            };

            callbacks.push(callback);
          } catch (error) {
            console.log('mongosockets | insert', error.stack);
            rejectInsert(error);
          }
        }),

        find: (finder) => new Promise(async (resolveFind, rejectFind) => {
          try {
            console.log('mongosockets | find', finder);

            const
              id = uuid.v4(),
              doc = {
                action: 'find',
                id,
                ...finder,
              },
              raw = JSON.stringify(doc);

            console.log('mongosockets | send', doc);

            conn.ws.send(raw);

            console.log('mongosockets | end', raw);

            const callback = ({id: messageId, results}) => {
              if (messageId === id) {
                console.log('mongosockets | response', {id, results});
                callbacks = callbacks.filter((cb) => cb !== callback);
                resolveFind(results);
              }
            };

            callbacks.push(callback);
          } catch (error) {
            console.log('mongosockets | find', error);
            rejectFind(error);
          }
        }),

        update: (updater) =>
        new Promise(async (resolveUpdate, rejectUpdate) => {
          try {
            console.log('mongosockets | update', updater);

            const
              id = uuid.v4(),
              doc = {
                action: 'update',
                id,
                ...updater,
              },
              raw = JSON.stringify(doc);

            console.log('mongosockets | send', doc);

            conn.ws.send(raw);

            console.log('mongosockets | end', raw);

            const callback = ({id: messageId, results}) => {
              if (messageId === id) {
                console.log('mongosockets | response', {id, results});
                callbacks = callbacks.filter((cb) => cb !== callback);
                resolveUpdate(results);
              }
            };

            callbacks.push(callback);
          } catch (error) {
            console.log('mongosockets | update', error.stack);
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
