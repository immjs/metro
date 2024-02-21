import net from 'net';
import ipaddr from 'ipaddr.js';
import { WebSocket } from 'ws';
import { toConnectionTag, toConnectionTag16 } from './utils.js';

// const MAX_CONCURRENT_SOCKETS = 128;

// // Why 2?
// // Because the first bit will be used to determine whether the socket should be closed
// const impliedAllocatedBufferSize = Math.log2(2 * MAX_CONCURRENT_SOCKETS) / 8;

// TODO: Refactor

export function connectTo(host, port) {
  const socket = new WebSocket(`ws://${host}:${port}/s`);

  return new Promise((res) => {
    socket.on('open', () => {
      let connectionArray = Array(128 * 128*256);
    
      socket.on('message', (data) => {
        const clientTag = data.subarray(0, 1).readUint8();
        const isEnd = clientTag >= 128;
        const clientId = clientTag % 128;
    
        if (isEnd) {
          for (let i = 0; i < 128 * 256; i += 1) {
            const clientConnId = clientId * 128 * 256 + i;
            if (connectionArray[clientConnId] instanceof net.Socket) {
              connectionArray[clientConnId].close();
              delete connectionArray[clientConnId];
            }
          }
          return;
        }
    
        const connectionTag = data.subarray(1, 3).readUint16LE();
        const isConnectionEnd = connectionTag >= 128 * 256;
        const connectionId = connectionTag % (128 * 256);
    
        let actualData = data.subarray(3);
    
        const clientConnId = clientId * 128 * 256 + connectionId;
    
        if (isConnectionEnd) {
          if (connectionArray[clientConnId] == null) return;
          connectionArray[clientConnId].end();
          delete connectionArray[clientConnId];
          return;
        }
    
        if (!(connectionArray[clientConnId] instanceof net.Socket)) {
          const host = ipaddr.fromByteArray(actualData).toNormalizedString();
    
          connectionArray[clientConnId] = net.createConnection({
            host,
            port: 443,
          });
    
          connectionArray[clientConnId].on('data', (data) => {
            socket.send(Buffer.concat([
              toConnectionTag(clientId, false),
              toConnectionTag16(connectionId, false),
              data,
            ]));
          });
          connectionArray[clientConnId].on('close', () => {
            socket.send(Buffer.concat([
              toConnectionTag(clientId, false),
              toConnectionTag16(connectionId, true),
            ]));
            connectionArray[clientId * 128 * 256 + connectionId] = null;
          });
    
          return;
        }
    
        if (isEnd) return connectionArray[clientConnId].close();
        connectionArray[clientConnId].write(actualData);
      });
    });

    res(() => {
      return socket.close();
    });
  });
}
