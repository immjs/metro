// import Fastify from 'fastify';
import net from 'net';
import ipaddr from 'ipaddr.js';

export const spawnServer = async (port) => {
  const server = net.createServer((socket) => {
    console.log('ello')

    let isFirstPacket = true;
    let connection;

    socket.on('data', (data) => {
      // console.log(data);
      if (isFirstPacket) {
        isFirstPacket = false;
        let ip;
        try{
          ip = ipaddr.fromByteArray(data).toString();
        } catch (err) {
          socket.end();
          console.log('Communication ended', socket.remoteAddress);
          return;
        }
        console.log(ip);
        connection = net.createConnection(443, ip);
        connection.on('data', (data) => socket.write(data));
        connection.on('end', () => socket.end());
        connection.on('error', console.error);
        return;
      }
      connection.write(data);
    });

    socket.on('end', () => connection?.end());
    socket.on('error', console.error);
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
