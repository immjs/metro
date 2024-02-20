import { generateKeyPair } from 'crypto';

export function genKeypair() {
  return new Promise((res, rej) => {
    generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    }, (err, cert, pkey) => {
      if (err) rej(err);
      console.log(cert);
      res({ cert, pkey });
    });
  });
}
