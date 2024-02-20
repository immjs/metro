import socks from 'lum_socksv5';
import http from 'http';
import net from 'net';
import ipaddr from 'ipaddr.js';
import { resolve } from './dns.js';
import httpParser from 'http-string-parser';

export async function startSocks() {
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
        console.log(info);

        const ipBuffer = Buffer.from(ipaddr.parse(net.isIP(info.dstAddr)
          ? info.dstAddr
          : await resolve(info.dstAddr)).toByteArray());

        const socketHttpsIn = accept(true);
        const host = '89.95.197.91';
        const socketOut = net.createConnection({
          host,
          port: 59646,
        });

        socketOut.write(ipBuffer);

        socketHttpsIn.on('data', (data) => {
          // console.log('IN', data)
          socketOut.write(data)
        });
        socketOut.on('data', (data) => {
          // console.log('OUT', data)
          socketHttpsIn.write(data)
        });

        socketHttpsIn.on('end', () => socketOut.end());
        socketOut.on('end', () => socketHttpsIn.end());
        break;
      default:
        deny();
        break;
    }
  });

  srv.useAuth(socks.auth.None());

  return new Promise((res, rej) => {
    srv.listen(1080, 'localhost', function (err) {
      if (err) return rej(err);
      res();
    });
  });
}