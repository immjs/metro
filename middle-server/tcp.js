// import Fastify from 'fastify';
import { WebSocket, WebSocketServer } from 'ws';
import { RandomMap } from './randomstruct.js';
import { getFirstEmpty, toConnectionTag } from './utils.js';

export const spawnServer = async (port) => {
  const servers = new RandomMap();
  const clients = {};

  const server = new WebSocketServer({
    port,
  });
  server.on('connection', (socket, req) => {
    const ip = socket.remoteAddress;

    const path = req.url;

    if (path === '/s') {
      const myClients = Array(128);
      servers.set(ip, {
        clients: myClients,
        socket,
      });

      socket.on('message', (data) => {
        const clientTag = data.subarray(0, 1).readUint8();
        // Should never be reached
        // const isEnd = clientTag >= 128;
        const clientId = clientTag % 128;

        const actualData = data.subarray(1);

        const clientIp = myClients[clientId];

        console.log('S to C', actualData);

        clients[clientIp].send(actualData);
      });

      socket.on('close', () => {
        myClients.forEach((clientIp) => {
          if (clientIp != null && clients[clientIp] instanceof WebSocket) {
            clients[clientIp].close();
          }
        });

        servers.delete(ip);
      });
    } else if (path === '/c') {
      clients[ip] = socket;

      function roll() { // Prevent loopback, which... in theory should be fine but introduces statistical bias
        const serverIp = servers.getRandomKey();
        // if (serverIp === ip) return roll();
        return serverIp;
      }

      const serverIp = roll();
      const server = servers.get(serverIp);

      const clientId = getFirstEmpty(server.clients);
      server.clients[clientId] = ip;

      socket.on('message', (message) => {
        console.log('C to S', message);

        server.socket.send(Buffer.concat([
          toConnectionTag(clientId, false),
          message,
        ]));
      });

      socket.on('close', () => {
        server.socket.send(toConnectionTag(clientId, true));
        delete clients[ip];
      });
    } else {
      return socket.close();
    }
  });

  return new Promise((mountRes, mountRej) => {
    server.on('listening', () => {
      // Unmount
      mountRes(() => {
        return new Promise((umountRes) => {
          server.close(() => umountRes());
        });
      });
    });
  });
};
