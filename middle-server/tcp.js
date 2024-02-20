// import Fastify from 'fastify';
import net from 'net';
import { RandomMap } from './randomstruct.js';

export const spawnServer = async (port) => {
  const allSockets = new RandomMap();

  const server = net.createServer((socket) => {
    allSockets.set(socket, false);

    socket.on('data', (data) => {
      let recipient = allSockets.get(socket);
      if (!recipient) {
        const roll = (mustBeDiff) => { // Recursive rolling to prevent loopback
          if (allSockets.size < 2) throw new Error('Can\'t find another client');
          const newSocket = allSockets.getRandomKey();
          if (newSocket === mustBeDiff) return roll(mustBeDiff);
          return newSocket;
        };

        recipient = roll();

        allSockets.set(socket, recipient);
      }

      recipient.write(data);
    });

    socket.on('close', () => allSockets.delete(socket));
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
