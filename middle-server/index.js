import { spawnServer } from './ws.js';
import { advertise, externalIp } from './upnp.js';

import { randomPortNumber } from './utils.js';

import config from './config.js';

import data from './data.json' assert { type: 'json' };

export const nextPorts = Array.from({ length: config.allowNext }, () => randomPortNumber());

const instance = {};

console.log('External IP', await externalIp());

async function ouroborosServer() {
  try {
    const lastInstance = { ...instance };
  
    instance.port = nextPorts.shift();
    nextPorts.push(randomPortNumber());

    instance.closeServer = await spawnServer(instance.port);
    instance.closeUpnp = await advertise(instance.port);
  
    console.log('New port:', instance.port);

    // setTimeout(ouroborosServer, config.refreshServer * 1000);

    if ('closeUpnp' in lastInstance) await lastInstance.closeUpnp();
    if ('closeServer' in lastInstance) await lastInstance.closeServer();
  } catch (err) {
    setTimeout(ouroborosServer, config.retryRespawn * 1000);
  }
}

ouroborosServer();
