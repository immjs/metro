import { randomBytes } from 'crypto';

export function randomPortNumber() {
  // const listOfOnesAndZeroes = Array.from(new Uint8Array(randomBytes(14))).map((v) => v < 128 ? 1 : 0);

  // return listOfOnesAndZeroes.reduce((p, c) => p * 2 + c, 0) + 2**15 + 2**14;
  return 59646; // FOR TESTING PURPOSES
}

export function toConnectionTag(connectionId, isEnd) {
  const newConTag = connectionId + isEnd * 128;
  const newConBuf = Buffer.alloc(1);
  newConBuf.writeUint8(newConTag);
  return newConBuf;
}

export function getFirstEmpty(arr) {
  return arr.findIndex((v) => v == null);
}
