// import Fastify from 'fastify';
import net from 'net';
import { RandomMap } from './randomstruct.js';
import { toConnectionTag } from './utils.js';

export const spawnServer = async (port) => {
  const totalConnections = new RandomMap();

  const server = net.createServer((socket) => {
    console.log(totalConnections, socket);

    totalConnections.set(socket, 0);

    let connectionId;
    let recipient;

    socket.on('data', (data) => {
      if (!recipient) {
        const roll = (mustBeDiff) => { // Recursive rolling to prevent loopback
          if (totalConnections.size < 2) throw new Error('Can\'t find another client');
          const newSocket = totalConnections.getRandomKey();
          if (newSocket === mustBeDiff) return roll(mustBeDiff);
          return newSocket;
        };

        recipient = roll();

        connectionId = totalConnections.get(recipient);
        totalConnections.set(recipient, connectionId + 1);
      }

      recipient.write(Buffer.concat([
        toConnectionTag(connectionId, false),
        data,
      ]));
    });

    socket.on('close', () => {
      totalConnections.set(recipient, connectionId - 1);
    });
  });

  return new Promise((mountRes, mountRej) => {
    server.listen({ port }, () => {
      // Unmount
      mountRes(() => {
        return new Promise((umountRes) => {
          server.close(() => umountRes());
        });
      });
    });
  });
};
