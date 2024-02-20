import { startSocks } from './socks.js';

import { genKeypair } from './selfcert.js';

const clientKeypair = await genKeypair();

await startSocks();
console.log('Socks ready');
