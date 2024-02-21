import socks from 'lum_socksv5';
import net from 'net';
import WebSocket from 'ws';
import ipaddr from 'ipaddr.js';
import { resolve } from './dns.js';
import httpParser from 'http-string-parser';
import { getFirstEmpty, toConnectionTag16 } from './utils.js';

export async function startSocks() {
  const host = '141.94.205.110';
  const port = 59646;

  const socketOut = new WebSocket(`ws://${host}:${port}/c`);

  const connectArray = Array(128 * 256);

  socketOut.on('message', (data) => {
    const connectionTag = data.subarray(0, 2).readUint16LE();
    const isEnd = connectionTag >= 128 * 256;
    const connectionId = connectionTag % (128 * 256);
    let actualData = data.subarray(2);

    const socketHttpsIn = connectArray[connectionId];

    if (isEnd) return socketHttpsIn?.end();
    socketHttpsIn?.write(actualData);
  });

  const srv = socks.createServer(async function (info, accept, deny) {
    switch (info.dstPort) {
      case 80:
        const socketHttp = accept(true);
        socketHttp.on('data', (data) => {
          const req = httpParser.parseRequest(data.toString());

          const body = 'Please use HTTPS';
          socketHttp.end([
            'HTTP/1.1 301 Moved Permanently',
            'Content-Type: text/plain',
            `Location: https://${req.headers.Host}${req.uri}`,
            'Content-Length: ' + Buffer.byteLength(body),
            '',
            body
          ].join('\r\n'));
        });
        break;
      case 443:
        const ipBuffer = Buffer.from(ipaddr.parse(net.isIP(info.dstAddr)
          ? info.dstAddr
          : await resolve(info.dstAddr)).toByteArray());

        const socketHttpsIn = accept(true);
        const connectionId = getFirstEmpty(connectArray);

        socketOut.send(Buffer.concat([
          toConnectionTag16(connectionId, false),
          ipBuffer,
        ]));

        socketHttpsIn.on('data', (data) => {
          socketOut.send(Buffer.concat([
            toConnectionTag16(connectionId, false),
            data,
          ]));
        });
        connectArray[connectionId] = socketHttpsIn;

        socketHttpsIn.on('close', () => {
          socketOut.send(toConnectionTag16(connectionId, true));
        });
        break;
      default:
        deny();
        break;
    }
  });

  srv.useAuth(socks.auth.None());

  return Promise.all([
    new Promise((res, rej) => {
      srv.listen(1080, 'localhost', function (err) {
        if (err) return rej(err);
        res();
      });
    }),
    new Promise((res) => socketOut.on('open', res)),
  ]).then(([v]) => v);
}