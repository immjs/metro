import NatAPI from '@motrix/nat-api';
import config from './config.js';

const client = new NatAPI({
  description: 'Metro server',
});

export function advertise(port) {
  return new Promise((mountRes, mountRej) => {
    client.map({ publicPort: port, privatePort: port, ttl: config.refreshServer, protocol: 'TCP' }, (err) => {
      if (err) return mountRej(err);

      // Unmount
      mountRes(() => {
        return new Promise((umountRes, umountRej) => {
          client.unmap(port, (err) => {
            if (err) return umountRej(err);
            umountRes();
          });
        });
      });
    });
  });
}

export function externalIp() {
  return new Promise((res, rej) => {
    return client.externalIp(function(err, ip) {
      if (err) return rej(err);
      res(ip);
    })
  });
}
