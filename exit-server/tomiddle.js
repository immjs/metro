import net from 'net';
import ipaddr from 'ipaddr.js';

// const MAX_CONCURRENT_SOCKETS = 128;

// // Why 2?
// // Because the first bit will be used to determine whether the socket should be closed
// const impliedAllocatedBufferSize = Math.log2(2 * MAX_CONCURRENT_SOCKETS) / 8;

export function connectTo(host, port) {
  const socket = net.createConnection({
    host,
    port,
  });

  let socketArray = Array(128);

  socket.on('data', (data) => {
    const connectionTag = data.subarray(0, 1).readUint8();
    const isEnd = connectionTag > 128;
    const connectionId = connectionTag % 128;
    const actualData = data.subarray(1);

    if (!(connectionId in socketArray)) {
      const host = ipaddr.fromByteArray(actualData).toString();

      socketArray[connectionId] = net.createConnection({
        host,
        port: 443,
      });

      socketArray[connectionId].on('data', (data) => {
        const newConTag = connectionId;
        const newConBuf = Buffer.alloc(1);
        newConBuf.writeUint8(newConTag);
        const newMessage = Buffer.concat([
          newConBuf,
          data,
        ]);
        socket.write(newMessage);
      });
      socketArray[connectionId].on('close', () => {
        const newConTag = connectionId + 128;
        const newConBuf = Buffer.alloc(1);
        newConBuf.writeUint8(newConTag);
        socket.write(newConBuf);
      });

      return;
    }

    if (isEnd) return socketArray[connectionId].end();
    socketArray[connectionId].write(actualData);
  });
}
